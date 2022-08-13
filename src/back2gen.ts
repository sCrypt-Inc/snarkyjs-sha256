import {
    SelfProof, Field, ZkProgram, CircuitValue,
    prop, isReady, shutdown, CircuitString,
    Character, Circuit, Bool
} from 'snarkyjs';


class RawTransaction extends CircuitValue {
    // assume data is in hex encoded format, note the length limit 128 of CircuitString
    @prop data: CircuitString;

    constructor(data: CircuitString) {
        super(data);
    }

    hashToTxId(): TxId {
        return new TxId(this.data.hash());
    }

    isSpending(txId: TxId) {
        const TXID_START_POS_IN_HEX = 10; // 5 bytes * 2
        let txIdHex = txId.toHex();
        for (let i = 0; i < TxId.SIZE_IN_HEX; i++) {
            let src = this.data.values[TXID_START_POS_IN_HEX + i];
            src.assertEquals(txIdHex[i])
        }
    }

    toString(): string {
        return this.data.toString();
    }
}

class TxId extends CircuitValue {
    // real value is 32 bytes, could use smaller value for test
    static SIZE_IN_BYTES = 32;
    static SIZE_IN_HEX = TxId.SIZE_IN_BYTES * 2;

    @prop value: Field;
    constructor(value: Field) {
        super(value);
    }

    toHex(): Character[] {
        let bits = this.value.toBits();
        let hex = [];
        for (let i = 0; i < TxId.SIZE_IN_HEX; i++) {
            let hexBits = bits.slice(i * 4, (i + 1) * 4);
            hex.push(TxId.bits2Hex(hexBits));
        }
        return hex;
    }

    static bits2Hex(bits: Bool[]): Character {
        let hexCodes = ['0', '1', '2', '3', '4', '5', '6', '7',
            '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
        let c = Character.fromString('0');
        for (let i = 0; i < 16; i++) {
            c = Circuit.if(Field.fromNumber(i).equals(Field.ofBits(bits)), Character.fromString(hexCodes[i]), c);
        }
        return c;
    }

    toString(): string {
        return CircuitString.fromCharacters(this.toHex()).toString();
    }
}

class TxIdBinding extends CircuitValue {
    @prop value: TxId; // tx id
    @prop fromGenesis: TxId; // bind to genesis tx id

    constructor(value: TxId, fromGenesis: TxId) {
        super(value, fromGenesis);
    }
}

let TracebleCoin = ZkProgram({
    publicInput: TxIdBinding,

    methods: {
        genesis: {
            privateInputs: [RawTransaction],

            method(txIdBinding: TxIdBinding, curTx: RawTransaction) {
                let genesisTxId = curTx.hashToTxId();
                genesisTxId.assertEquals(txIdBinding.value);
                genesisTxId.assertEquals(txIdBinding.fromGenesis);
            }
        },

        transfer: {
            privateInputs: [RawTransaction, SelfProof],

            method(prevTxIdBinding: TxIdBinding, curTx: RawTransaction, earlyProof: SelfProof<TxIdBinding>) {
                earlyProof.verify();

                // validate `fromGenesis` claimed is the same with the proved one early
                prevTxIdBinding.fromGenesis.assertEquals(earlyProof.publicInput.fromGenesis);

                // validate `curTx` is spending `prevTx`
                curTx.isSpending(prevTxIdBinding.value);
            }
        }
    }
})

function buildTx(prevTxId: TxId): RawTransaction {
    const prefix = "0123456789";
    // Note: CircuitString has a length limit of 128 currently. So here just use a minimum dummy hex version.
    let hexString = prefix + prevTxId.toString();
    return new RawTransaction(CircuitString.fromString(hexString))
}

async function main() {
    await isReady;

    try {
        console.log('compiling ...', new Date());
        await TracebleCoin.compile();

        console.log('generate genesis ... ', new Date());
        let genesisTx = new RawTransaction(CircuitString.fromString("0123456789abcdef"))
        let genesisTxId = genesisTx.hashToTxId()
        console.log(`genesisTxId: ${genesisTxId.toString()}`)
        let genesisProof = await TracebleCoin.genesis(new TxIdBinding(genesisTxId, genesisTxId), genesisTx)
        // console.log(genesisProof)

        let prevProof = genesisProof;
        let prevTxId = genesisTxId;
        for (let i = 0; i < 2; i++) {
            let tx = buildTx(prevTxId);
            prevProof = await TracebleCoin.transfer(new TxIdBinding(prevTxId, genesisTxId), tx, prevProof);
            prevProof.verify();
            console.log(`Tx_${i} passed verify, ${tx.toString()}, txId: ${tx.hashToTxId().toString()}, prevTxId: ${prevTxId.toString()} `, new Date())
            prevTxId = tx.hashToTxId();
        }

        // for fake tx
        let fakedGenesis = new RawTransaction(CircuitString.fromString("0000000000000000"))
        let fakedGenesisTxId = fakedGenesis.hashToTxId()
        let fakedGenesisProof = await TracebleCoin.genesis(new TxIdBinding(fakedGenesisTxId, fakedGenesisTxId), fakedGenesis)
        let fakedTx = buildTx(fakedGenesisTxId);
        console.log(`fake tx: ${fakedTx.toString()}`);
        let throwed = false;
        try {
            // fake binding with (fakedGenesisTxId, genesisTxId)
            let fakeBinding = new TxIdBinding(fakedGenesisTxId, genesisTxId)
            let proof = await TracebleCoin.transfer(
                fakeBinding,
                fakedTx,
                fakedGenesisProof
            )
            proof.verify();
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
