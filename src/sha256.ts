import {
  Field,
  Circuit,
  circuitMain,
  public_,
  isReady,
  Bool,
  shutdown,
  arrayProp,
  CircuitValue,
  ZkProgram,
  SelfProof,
  verify
} from 'snarkyjs';

import { createHash } from 'crypto'


export function sha256(hexstr: string): string {
  return createHash('sha256').update(Buffer.from(hexstr, 'hex')).digest('hex');
}

export function hash256(hexstr: string): string {
  return sha256(sha256(hexstr))
}

const N = 32
class Word extends CircuitValue {
  @arrayProp(Bool, N) value: Bool[];

  constructor(value: Bool[]) {
    super(value);
    this.value = value;
  }

  // little endian
  toString(): string {
    return this.value.map((b) => b.toBoolean() ? '1' : '0').reverse().join('')
  }

  toNumString(): string {
    return Field.ofBits(this.value).toString();
  }

  static fromNumber(n: number): Word {
    return new Word(Field.fromNumber(n).toBits(N))
  }

  static shiftR(w: Word, n: number): Word {
    const arr = w.value;

    let r: Bool[] = Word.fromNumber(0).value;

    // 001
    // 010
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 32; j++) {
        //const toUpdate = Field(j - i).equals(n)
        // little endian
        r[i] = j - i == n ? arr[j] : r[i];
      }
    }

    const ret = new Word(r);

    return ret
  }


  static shiftL(w: Word, n: number): Word {
    const arr = w.value;

    let r: Bool[] = Word.fromNumber(0).value;

    // 010
    // 001
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 32; j++) {
        // little endian
        r[j] = j - i == n ? arr[i] : r[j];
      }
    }

    const ret = new Word(r)

    return ret
  }


  static and(a: Word, b: Word): Word {
    const a_ = a.value;
    const b_ = b.value;
    let r: Bool[] = [];


    for (let i = 0; i < 32; i++) {
      r.push(a_[i].and(b_[i]));
    }

    const ret = new Word(r)

    return ret
  }

  static not(w: Word): Word {
    const a_ = w.value;

    let r: Bool[] = [];

    for (let i = 0; i < 32; i++) {
      r.push(a_[i].not());
    }

    const ret = new Word(r)

    return ret
  }


  static or(a: Word, b: Word): Word {
    const a_ = a.value;
    const b_ = b.value;
    let r: Bool[] = [];


    for (let i = 0; i < 32; i++) {
      r.push(a_[i].or(b_[i]));
    }

    const ret = new Word(r)
    return ret
  }


  static xor(a: Word, b: Word): Word {
    const a_ = a.value;
    const b_ = b.value;
    let r: Bool[] = [];

    for (let i = 0; i < 32; i++) {
      r.push(a_[i].equals(b_[i]).not());
    }

    return new Word(r)
  }

  static add(a: Word, b: Word): Word {
    const a_ = Field.ofBits(a.value)
    const b_ = Field.ofBits(b.value)
    const sum = a_.add(b_)
    const ret = new Word(sum.toBits(33).slice(0, 32))
    return ret;
  }


  static right_rotate(x: Word, n: number): Word {

    let bits: Bool[] = [];

    for (let i = 0; i < 32; i++) {
      let idx = n + i;
      if (idx > 31) {
        idx = idx - 32;
      }

      bits.push(x.value[idx]);
    }

    return new Word(bits);
  }

  static check(c: Word) {

  }
}

export class Chunk extends CircuitValue {
  @arrayProp(Word, 16) value: Word[];

  constructor(value: Word[]) {
    super(value);
    this.value = value;
  }

  // static fromBuffer(buffer: Buffer) {

  //   let r: Bool[] = [];
  //   for (let i = 0; i < 32; i++) {
  //     r.push(...Field.fromNumber(buffer[i]).toBits(8).reverse());
  //   }

  //   return new Hash(r);
  // }

  static fromWords(hash: Word[]): Chunk {

    let w: Word[] = [];

    for (let i = 0; i < 8; i++) {
      w.push(hash[i]);
    }

    w.push(Word.fromNumber(0x80000000));
    w.push(Word.fromNumber(0));
    w.push(Word.fromNumber(0));
    w.push(Word.fromNumber(0));
    w.push(Word.fromNumber(0));
    w.push(Word.fromNumber(0));
    w.push(Word.fromNumber(0));
    w.push(Word.fromNumber(0x100));

    return new Chunk(w);
  }


  /**
   * can not be used in Circuit
   * @param buffer 
   * @returns return a Preimage
   */
  static fromBuffer128(buffer: Buffer): Chunk {

    if(buffer.length != 16) {
      throw new Error("expected buffer length = 16")
    }

    return new Chunk([Word.fromNumber(buffer.readUInt32BE(0)),
      Word.fromNumber(buffer.readUInt32BE(4)),
      Word.fromNumber(buffer.readUInt32BE(8)),
      Word.fromNumber(buffer.readUInt32BE(12)),
      Word.fromNumber(0x80000000),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(128)])
  }


  /**
   * can not be used in Circuit
   * @param buffer 
   * @returns return a Preimage
  */
  static fromBuffer256(buffer: Buffer): Chunk {

    if(buffer.length != 32) {
      throw new Error("expected buffer length = 32")
    }

    return new Chunk([Word.fromNumber(buffer.readUInt32BE(0)),
      Word.fromNumber(buffer.readUInt32BE(4)),
      Word.fromNumber(buffer.readUInt32BE(8)),
      Word.fromNumber(buffer.readUInt32BE(12)),
      Word.fromNumber(buffer.readUInt32BE(16)),
      Word.fromNumber(buffer.readUInt32BE(20)),
      Word.fromNumber(buffer.readUInt32BE(24)),
      Word.fromNumber(buffer.readUInt32BE(28)),
      Word.fromNumber(0x80000000),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(0),
      Word.fromNumber(256)])
  }

  static check(x: Chunk) {

  }
}

export class Hash extends CircuitValue {
  @arrayProp(Bool, 256) value: Bool[];

  constructor(value: Bool[]) {
    super(value);
    this.value = value;
  }

  static fromBools(bits: Bool[]) {
    return new Hash(bits);
  }

  static fromWords(w: Word[]) {
    let bits: Bool[] = [];

    for (let i = 0; i < 8; i++) {
      for (let j = 31; j >= 0; j--) {
        bits.push(w[i].value[j])
      }
    }
    return Hash.fromBools(bits);
  }

  static fromBuffer(buffer: Buffer) {

    let r: Bool[] = [];
    for (let i = 0; i < 32; i++) {
      r.push(...Field.fromNumber(buffer[i]).toBits(8).reverse());
    }

    return new Hash(r);
  }

  toString() {
    let r: number[] = [];

    for (let i = 0; i < 32; i++) {
      const t = this.value.slice(i * 8, i * 8 + 8).reverse();
      r.push(Number(Field.ofBits(t).toBigInt()));
    }

    return Buffer.from(r).toString('hex')
  }
}

export default class Sha256 extends Circuit {
  @circuitMain
  static main(preimage: Chunk, @public_ hash: Hash) {
    hash.assertEquals(Sha256.sha256([preimage]));
  }
  static sha256Impl(preimage: Chunk[]): Word[] {
    console.log('sha256Impl...')
    const h0 = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19].map(n => Word.fromNumber(n));
    
    let hi = h0;
    for (let i = 0; i < preimage.length; i++) {
      hi = Sha256.g(hi, preimage[i].value)
    }

    return hi;
  }

  static sha256(preimage: Chunk[]) {
    const h = Sha256.sha256Impl(preimage);
    return Hash.fromWords(h)
  }

  static hash256(preimage: Chunk[]) {
    const hash = Sha256.sha256Impl(preimage);
    return Hash.fromWords(Sha256.sha256Impl([Chunk.fromWords(hash)]))
  }

  static compression(hprev: Word[], w: Word[]) {

    let a = hprev[0];
    let b = hprev[1];
    let c = hprev[2];
    let d = hprev[3];
    let e = hprev[4];
    let f = hprev[5];
    let g = hprev[6];
    let h = hprev[7];

    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2].map(n => Word.fromNumber(n));


    for (let i = 0; i < 64; i++) {
      //S1 := rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)
      const sigma1 = Word.xor(Word.xor(Word.right_rotate(e, 6), Word.right_rotate(e, 11)), Word.right_rotate(e, 25));
      //ch := (e & f) ^ ((^e) & g)
      const ch = Word.xor(Word.and(e, f), Word.and(Word.not(e), g));
      //temp1 := h + S1 + ch + k[i] + w[i]
      const t1 = Sha256.mod_add_5([h, sigma1, ch, k[i], w[i]]);
      //S0 := rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)
      const sigma0 = Word.xor(Word.xor(Word.right_rotate(a, 2), Word.right_rotate(a, 13)), Word.right_rotate(a, 22));
      //maj := (a & b) ^ (a & c) ^ (b & c)
      const maj = Word.xor(Word.xor(Word.and(a, b), Word.and(a, c)), Word.and(b, c));
      //temp2 := S0 + maj
      const t2 = Word.add(sigma0, maj);

      h = g
      g = f
      f = e
      e = Word.add(d, t1);
      d = c
      c = b
      b = a
      a = Word.add(t1, t2);

    }

    return [Word.add(hprev[0], a),
    Word.add(hprev[1], b),
    Word.add(hprev[2], c),
    Word.add(hprev[3], d),
    Word.add(hprev[4], e),
    Word.add(hprev[5], f),
    Word.add(hprev[6], g),
    Word.add(hprev[7], h)];

  }


  static g(hprev: Word[], chuck: Word[]) {

    const w: Word[] = [];
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        w.push(chuck[i])
      } else {
        w.push(Sha256.mod_add_4([w[i -16], Sha256.s0(w[i -15]), w[i -7], Sha256.s1(w[i -2])]));
      }
    }

    return Sha256.compression(hprev, w);

  }


  static s0(w: Word): Word {
    return Word.xor(Word.xor(Word.right_rotate(w, 7), Word.right_rotate(w, 18)), Word.shiftR(w, 3));
  }

  static s1(w: Word): Word {
    return Word.xor(Word.xor(Word.right_rotate(w, 17), Word.right_rotate(w, 19)), Word.shiftR(w, 10));
  }

  static mod_add_4(a: Word[]): Word {

    let acc = Field.ofBits(a[0].value);
    for (let i = 1; i < 4; i++) {
      acc = acc.add(Field.ofBits(a[i].value));
    }

    return new Word(acc.toBits(34).slice(0, 32));
  }

  static mod_add_5(a: Word[]): Word {

    let acc = Field.ofBits(a[0].value);
    for (let i = 1; i < 5; i++) {
      acc = acc.add(Field.ofBits(a[i].value));
    }

    return new Word(acc.toBits(35).slice(0, 32));
  }

}



async function main() {

  console.log('main ......')
  const chunk = Chunk.fromBuffer256(Buffer.from(sha256('80000000000000000000000000000000'), 'hex'))


  const hashbuf = Buffer.from(hash256("80000000000000000000000000000000"), 'hex');

  console.log(hashbuf.toString('hex'))
  const hash = Hash.fromBuffer(hashbuf)

  console.log(hash.toString())

  // let info = Circuit.constraintSystem(() => {

  //   console.log('constraintSystem...')
  //   Sha256.main(Sha256.witness(Preimage, () => preimage), Sha256.witness(Hash, () => hash));

  // });

  // console.log(`Sha256.main() creates ${info.rows} contraints`);

  const kp = Sha256.generateKeypair();
  const pi = Sha256.prove([chunk], [hash], kp);
  console.log('proof', pi);
  const success = Sha256.verify([hash], kp.verificationKey(), pi)
  console.log('verify', success);

  await shutdown();
}


async function recursion_main() {

  console.log('recursion_main ......')
  const preimage = new Chunk([Word.fromNumber(2147483648),
    Word.fromNumber(0),
    Word.fromNumber(0),
    Word.fromNumber(0),
    Word.fromNumber(2147483648),
    Word.fromNumber(0),
    Word.fromNumber(0),
    Word.fromNumber(0),
    Word.fromNumber(0),
    Word.fromNumber(0),
    Word.fromNumber(0),
    Word.fromNumber(0),
    Word.fromNumber(0),
    Word.fromNumber(0),
    Word.fromNumber(0),
    Word.fromNumber(128)])

    
  let Sha256dProgram = ZkProgram({
    publicInput: Hash,
  
    methods: {
      baseCase: {
        privateInputs: [Chunk],
  
        method(publicInput: Hash, chunk: Chunk) {
          publicInput.assertEquals(Sha256.sha256([chunk]));
        },
      },
  
      inductiveCase: {
        privateInputs: [Chunk, SelfProof],
  
        method(publicInput: Hash, chunk: Chunk, earlierProof: SelfProof<Hash>) {
          earlierProof.verify();
          publicInput.assertEquals(Sha256.sha256([chunk]));
        },
      },
    },
  });

  let MyProof = ZkProgram.Proof(Sha256dProgram);

  console.log('program digest', Sha256dProgram.digest());
  
  console.log('compiling MyProgram...');
  let { verificationKey } = await Sha256dProgram.compile();
  console.log('verification key', verificationKey.slice(0, 10) + '..');


  const hashbuf = Buffer.from(sha256("80000000000000000000000000000000"), 'hex');

  console.log(hashbuf.toString('hex'))
  const hash = Hash.fromBuffer(hashbuf)
  
  console.log('proving base case...');
  let proof = await Sha256dProgram.baseCase(hash, preimage);
  
  console.log('verify...');
  let ok = await verify(proof, verificationKey);
  console.log('ok?', ok);
  
  console.log('proving step 1...');
  const hash1 = Sha256.sha256([preimage]);
  
  console.log('hash1', hash1.toString());
  proof = await Sha256dProgram.inductiveCase(hash1, preimage, proof);
  console.log('verify alternative...');
  ok = await Sha256dProgram.verify(proof);
  console.log('ok (alternative)?', ok);

  // console.log('proving step 2...');
  // proof = await Sha256dProgram.inductiveCase(hash1, new Preimage([Word.fromNumber(2147483648),
  //   Word.fromNumber(1),
  //   Word.fromNumber(1),
  //   Word.fromNumber(1),
  //   Word.fromNumber(2147483648),
  //   Word.fromNumber(0),
  //   Word.fromNumber(0),
  //   Word.fromNumber(0),
  //   Word.fromNumber(0),
  //   Word.fromNumber(0),
  //   Word.fromNumber(0),
  //   Word.fromNumber(0),
  //   Word.fromNumber(0),
  //   Word.fromNumber(0),
  //   Word.fromNumber(0),
  //   Word.fromNumber(128)]), proof);
  // console.log('verify alternative...');
  // ok = await Sha256dProgram.verify(proof);
  // console.log('ok (alternative)?', ok);


}

try {
  await isReady
  await main();
  //await recursion_main();

  await shutdown()
} catch (error) {
  console.log(error)
}
