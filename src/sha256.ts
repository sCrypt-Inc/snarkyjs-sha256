import {
  Field,
  Circuit,
  circuitMain,
  public_,
  isReady,
  Encoding,
  Bool,
  UInt32,
  shutdown,
  arrayProp,
  CircuitValue,
} from 'snarkyjs';

import { createHash } from 'crypto'


const N = 32
class Word extends CircuitValue {
  @arrayProp(Bool, N) value: Bool[];

  constructor(value: Bool[]) {
    super();
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

  static shiftR(w: Word, n: Field): Word {
    const arr = w.value;

    let r: Bool[] = Word.fromNumber(0).value;

    // 001
    // 010
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 32; j++) {
        const toUpdate = Field(j - i).equals(n)
        // little endian
        r[i] = Circuit.if(toUpdate, arr[j], r[i])
      }
    }

    const ret = new Word(r);

    return ret
  }


  static shiftL(w: Word, n: Field): Word {
    const arr = w.value;

    let r: Bool[] = Word.fromNumber(0).value;

    // 010
    // 001
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 32; j++) {
        const toUpdate = Field(j - i).equals(n)
        // little endian
        r[j] = Circuit.if(toUpdate, arr[i], r[j])
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
      r.push(Circuit.if(a_[i].equals(b_[i]), Bool(false), Bool(true)));
    }

    return new Word(r)
  }

  static add(a: Word, b: Word): Word {
    const a_ = Field.ofBits(a.value)
    const b_ = Field.ofBits(b.value)
    const sum = a_.add(b_)
    const ret = new Word(sum.toBits().slice(0, 32))
    return ret;
  }

  static check(c: Word) {

  }
}

export class Preimage extends CircuitValue {
  @arrayProp(Word, 16) value: Word[];

  constructor(value: Word[]) {
    super();
    this.value = value;
  }
}

export class Hash extends CircuitValue {
  @arrayProp(Bool, 256) value: Bool[];

  constructor(value: Bool[]) {
    super();
    this.value = value;
  }

  static fromBools(bits: Bool[]) {
    return new Hash(bits);
  }

  static fromBuffer(buffer: Buffer) {

    let r: Bool[] = [];
    for (let i = 0; i < 32; i++) {
      r.push(...Field.fromNumber(buffer[i]).toBits(8).reverse());

    }

    return new Hash(r);
  }
}

export default class Sha256 extends Circuit {
  @circuitMain
  static main(preimage: Preimage, @public_ hash: Hash) {

    console.log('main...')

    const h0 = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19].map(n => Word.fromNumber(n));

    const h = Sha256.g(h0, preimage.value)
    // Circuit.asProver(() => {
    //   for (let i = 0; i < h.length; i++) {
    //     console.log('wi', i, h[i].toNumString());
    //   }
    // })

    let bits: Bool[] = [];

    for (let i = 0; i < 8; i++) {
      for (let j = 31; j >= 0; j--) {
        bits.push(h[i].value[j])
      }
    }


    // Circuit.asProver(() => {

    //   console.log("aaa", bits.map(b => b.toBoolean() ? "1" : '0').join(""))
    //   console.log("aaa", hash.value.map(b => b.toBoolean() ? "1" : '0').join(""))
    // })

    hash.assertEquals(Hash.fromBools(bits));

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
      // const ch = ((e & f) ^ (~e & g));
      const ch = Word.xor(Word.and(e, f), (Word.and(Word.not(e), g)));
      //const maj = ((a & b) ^ (a & c) ^ (b & c));
      const maj = Word.xor(Word.xor(Word.and(a, b), Word.and(a, c)), Word.and(b, c));
      //const sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
      const sigma0 = Word.xor(
        Word.xor(
          Word.or(Word.shiftL(a, Field(30)), Word.shiftR(a, Field(2))),
          Word.or(Word.shiftL(a, Field(19)), Word.shiftR(a, Field(13)))),
        Word.or(Word.shiftL(a, Field(10)), Word.shiftR(a, Field(22))));

      // const sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7) | (e >>> 25));
      const sigma1 = Word.xor(
        Word.xor(
          Word.or(Word.shiftL(e, Field(26)), Word.shiftR(e, Field(6))),
          Word.or(Word.shiftL(e, Field(21)), Word.shiftR(e, Field(11)))),
        Word.or(Word.shiftL(e, Field(7)), Word.shiftR(e, Field(25))));

      // const t1 = (h + sigma1 + ch + K[i] + W[i]);
      const t1 = Sha256.mod_add_5([h, sigma1, ch, k[i], w[i]]);

      // const t2 = (sigma0 + maj);
      const t2 = Word.add(sigma0, maj);

      h = g;
      g = f;
      f = e;
      e = Word.add(d, t1);
      d = c;
      c = b;
      b = a;
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

    const w00 = chuck[0];
    const w01 = chuck[1];
    const w02 = chuck[2];
    const w03 = chuck[3];
    const w04 = chuck[4];
    const w05 = chuck[5];
    const w06 = chuck[6];
    const w07 = chuck[7];
    const w08 = chuck[8];
    const w09 = chuck[9];
    const w10 = chuck[10];
    const w11 = chuck[11];
    const w12 = chuck[12];
    const w13 = chuck[13];
    const w14 = chuck[14];
    const w15 = chuck[15];
    const w16 = Sha256.mod_add_4([w00, Sha256.s0(w01), w09, Sha256.s1(w14)]);
    const w17 = Sha256.mod_add_4([w01, Sha256.s0(w02), w10, Sha256.s1(w15)]);
    const w18 = Sha256.mod_add_4([w02, Sha256.s0(w03), w11, Sha256.s1(w16)]);
    const w19 = Sha256.mod_add_4([w03, Sha256.s0(w04), w12, Sha256.s1(w17)]);
    const w20 = Sha256.mod_add_4([w04, Sha256.s0(w05), w13, Sha256.s1(w18)]);
    const w21 = Sha256.mod_add_4([w05, Sha256.s0(w06), w14, Sha256.s1(w19)]);
    const w22 = Sha256.mod_add_4([w06, Sha256.s0(w07), w15, Sha256.s1(w20)]);
    const w23 = Sha256.mod_add_4([w07, Sha256.s0(w08), w16, Sha256.s1(w21)]);
    const w24 = Sha256.mod_add_4([w08, Sha256.s0(w09), w17, Sha256.s1(w22)]);
    const w25 = Sha256.mod_add_4([w09, Sha256.s0(w10), w18, Sha256.s1(w23)]);
    const w26 = Sha256.mod_add_4([w10, Sha256.s0(w11), w19, Sha256.s1(w24)]);
    const w27 = Sha256.mod_add_4([w11, Sha256.s0(w12), w20, Sha256.s1(w25)]);
    const w28 = Sha256.mod_add_4([w12, Sha256.s0(w13), w21, Sha256.s1(w26)]);
    const w29 = Sha256.mod_add_4([w13, Sha256.s0(w14), w22, Sha256.s1(w27)]);
    const w30 = Sha256.mod_add_4([w14, Sha256.s0(w15), w23, Sha256.s1(w28)]);
    const w31 = Sha256.mod_add_4([w15, Sha256.s0(w16), w24, Sha256.s1(w29)]);
    const w32 = Sha256.mod_add_4([w16, Sha256.s0(w17), w25, Sha256.s1(w30)]);
    const w33 = Sha256.mod_add_4([w17, Sha256.s0(w18), w26, Sha256.s1(w31)]);
    const w34 = Sha256.mod_add_4([w18, Sha256.s0(w19), w27, Sha256.s1(w32)]);
    const w35 = Sha256.mod_add_4([w19, Sha256.s0(w20), w28, Sha256.s1(w33)]);
    const w36 = Sha256.mod_add_4([w20, Sha256.s0(w21), w29, Sha256.s1(w34)]);
    const w37 = Sha256.mod_add_4([w21, Sha256.s0(w22), w30, Sha256.s1(w35)]);
    const w38 = Sha256.mod_add_4([w22, Sha256.s0(w23), w31, Sha256.s1(w36)]);
    const w39 = Sha256.mod_add_4([w23, Sha256.s0(w24), w32, Sha256.s1(w37)]);
    const w40 = Sha256.mod_add_4([w24, Sha256.s0(w25), w33, Sha256.s1(w38)]);
    const w41 = Sha256.mod_add_4([w25, Sha256.s0(w26), w34, Sha256.s1(w39)]);
    const w42 = Sha256.mod_add_4([w26, Sha256.s0(w27), w35, Sha256.s1(w40)]);
    const w43 = Sha256.mod_add_4([w27, Sha256.s0(w28), w36, Sha256.s1(w41)]);
    const w44 = Sha256.mod_add_4([w28, Sha256.s0(w29), w37, Sha256.s1(w42)]);
    const w45 = Sha256.mod_add_4([w29, Sha256.s0(w30), w38, Sha256.s1(w43)]);
    const w46 = Sha256.mod_add_4([w30, Sha256.s0(w31), w39, Sha256.s1(w44)]);
    const w47 = Sha256.mod_add_4([w31, Sha256.s0(w32), w40, Sha256.s1(w45)]);
    const w48 = Sha256.mod_add_4([w32, Sha256.s0(w33), w41, Sha256.s1(w46)]);
    const w49 = Sha256.mod_add_4([w33, Sha256.s0(w34), w42, Sha256.s1(w47)]);
    const w50 = Sha256.mod_add_4([w34, Sha256.s0(w35), w43, Sha256.s1(w48)]);
    const w51 = Sha256.mod_add_4([w35, Sha256.s0(w36), w44, Sha256.s1(w49)]);
    const w52 = Sha256.mod_add_4([w36, Sha256.s0(w37), w45, Sha256.s1(w50)]);
    const w53 = Sha256.mod_add_4([w37, Sha256.s0(w38), w46, Sha256.s1(w51)]);
    const w54 = Sha256.mod_add_4([w38, Sha256.s0(w39), w47, Sha256.s1(w52)]);
    const w55 = Sha256.mod_add_4([w39, Sha256.s0(w40), w48, Sha256.s1(w53)]);
    const w56 = Sha256.mod_add_4([w40, Sha256.s0(w41), w49, Sha256.s1(w54)]);
    const w57 = Sha256.mod_add_4([w41, Sha256.s0(w42), w50, Sha256.s1(w55)]);
    const w58 = Sha256.mod_add_4([w42, Sha256.s0(w43), w51, Sha256.s1(w56)]);
    const w59 = Sha256.mod_add_4([w43, Sha256.s0(w44), w52, Sha256.s1(w57)]);
    const w60 = Sha256.mod_add_4([w44, Sha256.s0(w45), w53, Sha256.s1(w58)]);
    const w61 = Sha256.mod_add_4([w45, Sha256.s0(w46), w54, Sha256.s1(w59)]);
    const w62 = Sha256.mod_add_4([w46, Sha256.s0(w47), w55, Sha256.s1(w60)]);
    const w63 = Sha256.mod_add_4([w47, Sha256.s0(w48), w56, Sha256.s1(w61)]);

    const w = [
      w00, w01, w02, w03, w04, w05, w06, w07,
      w08, w09, w10, w11, w12, w13, w14, w15,
      w16, w17, w18, w19, w20, w21, w22, w23,
      w24, w25, w26, w27, w28, w29, w30, w31,
      w32, w33, w34, w35, w36, w37, w38, w39,
      w40, w41, w42, w43, w44, w45, w46, w47,
      w48, w49, w50, w51, w52, w53, w54, w55,
      w56, w57, w58, w59, w60, w61, w62, w63
    ];

    //   Circuit.asProver(() => {

    //     for (let i = 0; i < w.length; i++) {
    //       console.log('wi', i, w[i].toNumString());
    //     }
    //   })

    // const w = [
    //   Word.fromNumber(2147483648), Word.fromNumber(0), Word.fromNumber(0), Word.fromNumber(0), Word.fromNumber(2147483648), Word.fromNumber(0), Word.fromNumber(0), Word.fromNumber(0),
    //   Word.fromNumber(0), Word.fromNumber(0), Word.fromNumber(0), Word.fromNumber(0), Word.fromNumber(0), Word.fromNumber(0), Word.fromNumber(0), Word.fromNumber(128),
    //   Word.fromNumber(2147483648), Word.fromNumber(5242880), Word.fromNumber(2117632), Word.fromNumber(285226018), Word.fromNumber(2717911040), Word.fromNumber(479267501), Word.fromNumber(86558146), Word.fromNumber(604244376),
    //   Word.fromNumber(2057832448), Word.fromNumber(2249615232), Word.fromNumber(371117093), Word.fromNumber(2702302800), Word.fromNumber(3693394220), Word.fromNumber(3656566431), Word.fromNumber(4020831841), Word.fromNumber(3344077814),
    //   Word.fromNumber(2850564084), Word.fromNumber(1176995508), Word.fromNumber(57371836), Word.fromNumber(935737620), Word.fromNumber(1924951558), Word.fromNumber(2646558236), Word.fromNumber(3188273643), Word.fromNumber(662123519),
    //   Word.fromNumber(132479735), Word.fromNumber(82976880), Word.fromNumber(587059131), Word.fromNumber(3564991523), Word.fromNumber(1831900348), Word.fromNumber(1280217504), Word.fromNumber(3247208456), Word.fromNumber(1606633922),
    //   Word.fromNumber(3824489119), Word.fromNumber(3661145806), Word.fromNumber(2749372480), Word.fromNumber(95580149), Word.fromNumber(3373755984), Word.fromNumber(1712908532), Word.fromNumber(2935780836), Word.fromNumber(624436453),
    //   Word.fromNumber(4279189747), Word.fromNumber(3249421241), Word.fromNumber(1899504857), Word.fromNumber(3364093649), Word.fromNumber(3618550374), Word.fromNumber(2474421444), Word.fromNumber(3544608726), Word.fromNumber(2312060986)
    // ];

    return Sha256.compression(hprev, w);

  }


  static s0(w: Word): Word {
    const r1_0 = Word.or(Word.shiftL(w, Field(25)), Word.shiftR(w, Field(7)));
    const r1_1 = Word.or(Word.shiftL(w, Field(14)), Word.shiftR(w, Field(18)));
    const r1_2 = Word.shiftR(w, Field(3));
    return Word.xor(Word.xor(r1_0, r1_1), r1_2);
  }

  static s1(w: Word): Word {
    const r2_0 = Word.or(Word.shiftL(w, Field(15)), Word.shiftR(w, Field(17)));
    const r2_1 = Word.or(Word.shiftL(w, Field(13)), Word.shiftR(w, Field(19)));
    const r2_2 = Word.shiftR(w, Field(10));
    return Word.xor(Word.xor(r2_0, r2_1), r2_2);
  }

  static mod_add_4(a: Word[]): Word {

    let acc = Field.ofBits(a[0].value);
    for (let i = 1; i < 4; i++) {
      acc = acc.add(Field.ofBits(a[i].value));
    }

    return new Word(acc.toBits().slice(0, 32));
  }

  static mod_add_5(a: Word[]): Word {

    let acc = Field.ofBits(a[0].value);
    for (let i = 1; i < 5; i++) {
      acc = acc.add(Field.ofBits(a[i].value));
    }

    return new Word(acc.toBits().slice(0, 32));
  }

}




async function main() {

  await isReady
  const kp = Sha256.generateKeypair();


  const preimage = new Preimage([Word.fromNumber(2147483648),
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



  const hashbuf = createHash('sha256').update(Buffer.from("80000000000000000000000000000000", 'hex')).digest();

  const hash = Hash.fromBuffer(hashbuf)

  const pi = Sha256.prove([preimage], [hash], kp);
  console.log('proof', pi);
  const success = Sha256.verify([hash], kp.verificationKey(), pi)
  console.log('verify', success);

  await shutdown();
}


main();