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
  Poseidon
} from 'snarkyjs';

let { toBytes, fromBytes, toString } = Encoding.Bijective.Fp;


class Optional<T> {
  isSome: Bool;
  value: T;

  constructor(isSome: Bool, value: T) {
    this.isSome = isSome;
    this.value = value;
  }
}


export class Preimage extends CircuitValue {
  @arrayProp(UInt32, 16) value: UInt32[];

  constructor(value: UInt32[]) {
    super();
    this.value = value;
  }

  // static from(array: Uint8Array): Preimage {
  //   array.slice(0, 4)

  // }


  hash() {
    return Poseidon.hash(this.value.map(v => v.value));
  }

}

export default class Sha256 extends Circuit {
  @circuitMain
  static main(preimage: Preimage, nBits: UInt32, @public_ hash: Field) {

    console.log('main...')



    try {

      //Sha256.mod_add(UInt32.from(0), Sha256.s0(UInt32.from(0)), UInt32.from(128), Sha256.s1(UInt32.from(2717911040)));

      //const a = Sha256.not(UInt32.fromNumber(1))

      // /a.assertEquals(UInt32.fromNumber(0));

      const l1 = Sha256.shiftR(UInt32.fromNumber(4294967295), 30)

      const l2 = Sha256.shiftL(UInt32.fromNumber(1), 30)


      Circuit.asProver(() => {
        console.log('l1', l1.toString())
        console.log('l2', l2.toString())
      })

      const result = Sha256.g(UInt32.fromNumber(0x6a09e667),
        UInt32.fromNumber(0xbb67ae85),
        UInt32.fromNumber(0x3c6ef372),
        UInt32.fromNumber(0xa54ff53a),
        UInt32.fromNumber(0x510e527f),
        UInt32.fromNumber(0x9b05688c),
        UInt32.fromNumber(0x1f83d9ab),
        UInt32.fromNumber(0x5be0cd19), preimage.value)

    } catch (error) {
      console.error('g error', error)
    }

    console.log('g....')


  }



  static g(h0: UInt32, h1: UInt32, h2: UInt32, h3: UInt32, h4: UInt32, h5: UInt32, h6: UInt32, h7: UInt32, chuck: UInt32[]) {

    console.log('chuck', chuck.length)



    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2].map(n => UInt32.fromNumber(n));

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
    const w16 = Sha256.mod_add(w00, Sha256.s0(w01), w09, Sha256.s1(w14));
    // const a = Sha256.s0(w02);

    // const tmp1 = Sha256.shiftL(w15, 15);

    // const tmp2 = Sha256.shiftR(w15, 17);

    // Circuit.asProver(() => {
    //   console.log('w15', w15.toString())
    //   console.log('tmp1', tmp1.toString())
    //   console.log('tmp2', tmp2.toString())
    // })


  //   const r2_0 = Sha256.or(tmp1, tmp2);
  //   //const r2_1 = Sha256.or(Sha256.shiftL(w15, 13), Sha256.shiftR(w15, 19));
  //   //const r2_2 = Sha256.shiftR(w15, 10);
  //   //return Sha256.xor(Sha256.xor(r2_0, r2_1), r2_2);

  // //const b = Sha256.s1(w15);
    
    const w17 = Sha256.mod_add(w01, Sha256.s0(w02), w10, Sha256.s1(w15));
    const w18 = Sha256.mod_add(w02, Sha256.s0(w03), w11, Sha256.s1(w16));
    const w19 = Sha256.mod_add(w03, Sha256.s0(w04), w12, Sha256.s1(w17));
    const w20 = Sha256.mod_add(w04, Sha256.s0(w05), w13, Sha256.s1(w18));
    const w21 = Sha256.mod_add(w05, Sha256.s0(w06), w14, Sha256.s1(w19));
    const w22 = Sha256.mod_add(w06, Sha256.s0(w07), w15, Sha256.s1(w20));
    const w23 = Sha256.mod_add(w07, Sha256.s0(w08), w16, Sha256.s1(w21));
    const w24 = Sha256.mod_add(w08, Sha256.s0(w09), w17, Sha256.s1(w22));
    const w25 = Sha256.mod_add(w09, Sha256.s0(w10), w18, Sha256.s1(w23));
    const w26 = Sha256.mod_add(w10, Sha256.s0(w11), w19, Sha256.s1(w24));
    const w27 = Sha256.mod_add(w11, Sha256.s0(w12), w20, Sha256.s1(w25));
    const w28 = Sha256.mod_add(w12, Sha256.s0(w13), w21, Sha256.s1(w26));
    const w29 = Sha256.mod_add(w13, Sha256.s0(w14), w22, Sha256.s1(w27));
    const w30 = Sha256.mod_add(w14, Sha256.s0(w15), w23, Sha256.s1(w28));
    const w31 = Sha256.mod_add(w15, Sha256.s0(w16), w24, Sha256.s1(w29));
    const w32 = Sha256.mod_add(w16, Sha256.s0(w17), w25, Sha256.s1(w30));
    const w33 = Sha256.mod_add(w17, Sha256.s0(w18), w26, Sha256.s1(w31));
    const w34 = Sha256.mod_add(w18, Sha256.s0(w19), w27, Sha256.s1(w32));
    const w35 = Sha256.mod_add(w19, Sha256.s0(w20), w28, Sha256.s1(w33));
    const w36 = Sha256.mod_add(w20, Sha256.s0(w21), w29, Sha256.s1(w34));
    const w37 = Sha256.mod_add(w21, Sha256.s0(w22), w30, Sha256.s1(w35));
    const w38 = Sha256.mod_add(w22, Sha256.s0(w23), w31, Sha256.s1(w36));
    const w39 = Sha256.mod_add(w23, Sha256.s0(w24), w32, Sha256.s1(w37));
    const w40 = Sha256.mod_add(w24, Sha256.s0(w25), w33, Sha256.s1(w38));
    const w41 = Sha256.mod_add(w25, Sha256.s0(w26), w34, Sha256.s1(w39));
    const w42 = Sha256.mod_add(w26, Sha256.s0(w27), w35, Sha256.s1(w40));
    const w43 = Sha256.mod_add(w27, Sha256.s0(w28), w36, Sha256.s1(w41));
    const w44 = Sha256.mod_add(w28, Sha256.s0(w29), w37, Sha256.s1(w42));
    const w45 = Sha256.mod_add(w29, Sha256.s0(w30), w38, Sha256.s1(w43));
    const w46 = Sha256.mod_add(w30, Sha256.s0(w31), w39, Sha256.s1(w44));
    const w47 = Sha256.mod_add(w31, Sha256.s0(w32), w40, Sha256.s1(w45));
    const w48 = Sha256.mod_add(w32, Sha256.s0(w33), w41, Sha256.s1(w46));
    const w49 = Sha256.mod_add(w33, Sha256.s0(w34), w42, Sha256.s1(w47));
    const w50 = Sha256.mod_add(w34, Sha256.s0(w35), w43, Sha256.s1(w48));
    const w51 = Sha256.mod_add(w35, Sha256.s0(w36), w44, Sha256.s1(w49));
    const w52 = Sha256.mod_add(w36, Sha256.s0(w37), w45, Sha256.s1(w50));
    const w53 = Sha256.mod_add(w37, Sha256.s0(w38), w46, Sha256.s1(w51));
    const w54 = Sha256.mod_add(w38, Sha256.s0(w39), w47, Sha256.s1(w52));
    const w55 = Sha256.mod_add(w39, Sha256.s0(w40), w48, Sha256.s1(w53));
    const w56 = Sha256.mod_add(w40, Sha256.s0(w41), w49, Sha256.s1(w54));
    const w57 = Sha256.mod_add(w41, Sha256.s0(w42), w50, Sha256.s1(w55));
    const w58 = Sha256.mod_add(w42, Sha256.s0(w43), w51, Sha256.s1(w56));
    const w59 = Sha256.mod_add(w43, Sha256.s0(w44), w52, Sha256.s1(w57));
    const w60 = Sha256.mod_add(w44, Sha256.s0(w45), w53, Sha256.s1(w58));
    const w61 = Sha256.mod_add(w45, Sha256.s0(w46), w54, Sha256.s1(w59));
    const w62 = Sha256.mod_add(w46, Sha256.s0(w47), w55, Sha256.s1(w60));
    const w63 = Sha256.mod_add(w47, Sha256.s0(w48), w56, Sha256.s1(w61));



    Circuit.asProver(() => {
      const w = [
        w00, w01, w02, w03, w04, w05, w06, w07,
        w08, w09, w10, w11, w12, w13, w14, w15,w16
        // w16, w17, w18, w19, w20, w21, w22, w23,
        // w24, w25, w26, w27, w28, w29, w30, w31,
        // w32, w33, w34, w35, w36, w37, w38, w39,
        // w40, w41, w42, w43, w44, w45, w46, w47,
        // w48, w49, w50, w51, w52, w53, w54, w55,
        // w56, w57, w58, w59, w60, w61, w62, w63
      ];

      for (let i = 0; i < w.length; i++) {
        console.log('wi', i, w[i].toString());
      }

    })
    console.log('g end.')

  }


  static s0(w: UInt32): UInt32 {
    const r1_0 = Sha256.or(Sha256.shiftL(w, 25), Sha256.shiftR(w, 7));
    const r1_1 = Sha256.or(Sha256.shiftL(w, 14), Sha256.shiftR(w, 18));
    const r1_2 = Sha256.shiftR(w, 3);
    return Sha256.xor(Sha256.xor(r1_0, r1_1), r1_2);
  }

  static s1(w: UInt32): UInt32 {
    const r2_0 = Sha256.or(Sha256.shiftL(w, 15), Sha256.shiftR(w, 17));
    const r2_1 = Sha256.or(Sha256.shiftL(w, 13), Sha256.shiftR(w, 19));
    const r2_2 = Sha256.shiftR(w, 10);
    return Sha256.xor(Sha256.xor(r2_0, r2_1), r2_2);
  }

  static mod_add(gamma0: UInt32, wa: UInt32, gamma1: UInt32, wb: UInt32): UInt32 {
    return Sha256.add(Sha256.add(Sha256.add(gamma0, wa), gamma1), wb);
  }



  static add(a: UInt32, b: UInt32): UInt32 {
    const bits = a.value.add(b.value).toBits(32);
    return UInt32.from(Field.ofBits(bits));
  }

  static shiftR(u: UInt32, n: number): UInt32 {
    const arr = u.value.toBits(32);

    let r : Bool[] = Field.fromNumber(0).toBits(32);

    // 001
    // 010
    for (let i = 0; i < 32; i++) {
      //const item = i < 32 - n ? arr[i+n] :  Bool(false)
      //const item = Bool(false)
      r[i] = Circuit.if(i < 32 - n, arr[i], Bool(false))
    }

    return UInt32.from(Field.ofBits(r));
  }


  static shiftL(u: UInt32, n: number): UInt32 {
    // const arr = u.value.toBits(32);
    // const times = n > 32 ? 32 : n;
    // const bits: Bool[] = Array(times).fill(Bool(false)).concat(arr.splice(0, arr.length - times));


    const arr = u.value.toBits(32);

    let r : Bool[] = Field.fromNumber(0).toBits(32);


    for (let i = 0; i < 32; i++) {
      //const item = i>= n ? arr[i] :  Bool(false)
      //const item =  Bool(false)
      r[i] = Circuit.if(i < n, Bool(false), arr[i])
    }

    return UInt32.from(Field.ofBits(r));
  }



  static or(a: UInt32, b: UInt32): UInt32 {

    let aa = a.value.toBits(32);
    let bb = b.value.toBits(32);

    return UInt32.from(Field.ofBits(aa.map((a, i) => a.or(bb[i]))))
  }

  static and(a: UInt32, b: UInt32): UInt32 {

    let aa = a.value.toBits(32);
    let bb = b.value.toBits(32);

    return UInt32.from(Field.ofBits(aa.map((a, i) => a.and(bb[i]))))
  }

  static xor(a: UInt32, b: UInt32, i: number = -1): UInt32 {

    let aa = a.value.toBits(32);
    let bb = b.value.toBits(32);

    return UInt32.from(Field.ofBits(aa.map((itema, i) => {
      return Circuit.if(itema.equals(bb[i]), Bool(false), Bool(true))
    })))
  }

}




async function main() {

  await isReady
  const kp = Sha256.generateKeypair();

  console.log('generateKeypair successfully...')



  const preimage = new Preimage([Field.fromNumber(2147483648),
    Field.fromNumber(0),
    Field.fromNumber(0),
    Field.fromNumber(0),
    Field.fromNumber(2147483648),
    Field.fromNumber(0),
    Field.fromNumber(0),
    Field.fromNumber(0),
    Field.fromNumber(0),
    Field.fromNumber(0),
    Field.fromNumber(0),
    Field.fromNumber(0),
    Field.fromNumber(0),
    Field.fromNumber(0),
    Field.fromNumber(0),
    Field.fromNumber(128),
    ].map(i => UInt32.from(i)));


  // const preimageSize = UInt32.fromNumber(128);
  // // const hash = Poseidon.hash([preimage]);
  // // console.log(hash.toString())
  // const pi = Sha256.prove([preimage, preimageSize], [Field.fromNumber(4)], kp);
  // console.log('proof', pi);
  // const success = Sha256.verify([Field.fromNumber(4)], kp.verificationKey(), pi)
  // console.log('verify', success);

  await shutdown();
}


main();