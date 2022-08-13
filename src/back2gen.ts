import {
    SelfProof, Field, ZkProgram, CircuitValue,
    isReady, shutdown, Bool, arrayProp, Poseidon
} from 'snarkyjs';

await isReady;

// fixed in tx protocal
const PREFIX_LEN_IN_BYTES = 5; 
class RawTxPrefix extends CircuitValue {
    @arrayProp(Bool, PREFIX_LEN_IN_BYTES * 8) value: Bool[];
    constructor(value: Bool[]) {
        super(value);
    }
}

// determined by use case
const POSTFIX_LEN_IN_BYTES = 1;
class RawTxPostfix extends CircuitValue {
    @arrayProp(Bool, POSTFIX_LEN_IN_BYTES * 8) value: Bool[];
    constructor(value: Bool[]) {
        super(value);
    }
}

class TxId extends CircuitValue {
    @arrayProp(Bool, 32 * 8) value: Bool[];
    constructor(value: Bool[]) {
        super(value);
    }
    toString(): string {
        return bits2Hex(this.value);
    }
}

const HEX_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

function hex2Bits(hex: string): Bool[] {
    let bits: Bool[] = [];
    hex.split('').forEach(c => {
        let i = HEX_CHARS.indexOf(c);
        bits.push(...Field.fromNumber(i >= 0 ? i : 0).toBits(4))
    });
    return bits;
}

function bits2Hex(bits: Bool[]): string {
    return chunk(bits, 4)
        .map(cbits =>
            HEX_CHARS.at(Number(Field.ofBits(cbits).toBigInt()))
        )
        .join('')
}

function chunk(arr: Array<any>, size: number) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );
}

function hash2TxId(bits: Bool[]): TxId {
    let hash = Poseidon.hash(chunk(bits, 255).map(cbits => Field.ofBits(cbits))).toBits();
    hash.push(new Bool(false)); // padding hash to 256 bits
    if (hash.length !== 256) throw Error('TxId should be length of 256');
    return new TxId(hash);
}

// a dummy genesis tx id, should be modified in production env
const GENESIS_TX_ID = new TxId(hex2Bits("7967a5185e907a25225574544c31f7b059c1a191d65b53dcc1554d339c4f9efc"));

let TracebleCoin = ZkProgram({
    publicInput: TxId,

    methods: {
        genesis: {
            privateInputs: [],

            method(txId: TxId) {
                txId.assertEquals(GENESIS_TX_ID);
            }
        },

        transfer: {
            privateInputs: [RawTxPrefix, RawTxPostfix, SelfProof],

            method(curTxId: TxId, prefix: RawTxPrefix, postfix: RawTxPostfix, earlyProof: SelfProof<TxId>) {
                earlyProof.verify();
                let curRawTx = [...prefix.value, ...earlyProof.publicInput.value, ...postfix.value];
                curTxId.assertEquals(hash2TxId(curRawTx));
            }
        }
    }
})

async function main() {
    await isReady;

    try {
        console.log('compiling ...', new Date());
        await TracebleCoin.compile();

        console.log('generate genesis ... ', new Date());
        let genesisProof = await TracebleCoin.genesis(GENESIS_TX_ID);
        // console.log(genesisProof)

        let prevProof = genesisProof;
        let prevTxId = GENESIS_TX_ID;

        // dummy raw tx prefix
        const txPrefix = hex2Bits("0123456789");

        for (let i = 0; i < 2; i++) {
            // dummy rax tx postfix
            let txPostfix = hex2Bits('0' + i)
            let tx = [...txPrefix, ...prevTxId.value, ...txPostfix];
            let txId = hash2TxId(tx);
            prevProof = await TracebleCoin.transfer(txId, new RawTxPrefix(txPrefix), new RawTxPostfix(txPostfix), prevProof);
            prevProof.verify();
            console.log(`Tx_${i} passed verify, txId: ${txId.toString()}, prevTxId: ${prevTxId.toString()} `, new Date())
            prevTxId = txId;
        }

        let fakeTxId = hash2TxId(hex2Bits("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"));
        let throwed = false;
        try {
            await TracebleCoin.transfer(fakeTxId, new RawTxPrefix(txPrefix), new RawTxPostfix(hex2Bits('03')), prevProof);
        } catch (error) {
            throwed = true;
            console.log("Bingo, fake tx failed proof verify! ", new Date());
        }
        if (!throwed) throw Error('faked tx passed verfiy, it should just throw error!');
    } catch (error) {
        console.log(error)
    }

    shutdown();
}

main();
