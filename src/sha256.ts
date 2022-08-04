import {
  Field,
  Circuit,
  circuitMain,
  public_,
  isReady,
  Bool,
  UInt32
} from 'snarkyjs';


export default class Sha256 extends Circuit {
  @circuitMain
  static main(preimage: Field, nBits: UInt32, @public_ hash: Field) {

    //preimageSize.assertLte(UInt32.fromNumber(128));
    console.log('main...')
    const padded = preimage.toBits().slice(0, 128);


    padded.push(...[true, false, false, false, false, false, false, false].map(i => Bool(i)))

    for (let index = 0; index < 312; index++) {
      padded.push(Bool(false));
    }

    padded.push(...nBits.toUInt64().value.toBits(64).reverse())

    Field.ofBits(nBits.toUInt64().value.toBits(64)).assertEquals(128);


    const h0 = [UInt32.fromNumber(0x6a09e667), UInt32.fromNumber(0xbb67ae85), UInt32.fromNumber(0x3c6ef372), UInt32.fromNumber(0xa54ff53a), UInt32.fromNumber(0x510e527f), UInt32.fromNumber(0x9b05688c), UInt32.fromNumber(0x1f83d9ab), UInt32.fromNumber(0x5be0cd19)];


    const chunk = padded;


    // try {

    //   const gamma0x = UInt32.from(86558146);

    //   const r1_0 = Sha256.or(Sha256.shiftL(gamma0x, 25), Sha256.shiftR(gamma0x, 7));

    //   const r1_1 = Sha256.or(Sha256.shiftL(gamma0x, 14), Sha256.shiftR(gamma0x, 18));

    //   const r1_2 = Sha256.shiftR(gamma0x, 3);


    //   const gamma0 = Sha256.xor(Sha256.xor(r1_0, r1_1), r1_2);
    //   // const gamma0 = (((gamma0x << 25) | (gamma0x >>> 7)) ^
    //   //   ((gamma0x << 14) | (gamma0x >>> 18)) ^
    //   //   (gamma0x >>> 3));

    //   const gamma1x = UInt32.from(935737620);

    //   const r2_0 = Sha256.or(Sha256.shiftL(gamma1x, 15), Sha256.shiftR(gamma1x, 17));

    //   const r2_1 = Sha256.or(Sha256.shiftL(gamma1x, 13), Sha256.shiftR(gamma1x, 19));

    //   const r2_2 = Sha256.shiftR(gamma1x, 10);

    //   const gamma1 = Sha256.xor(Sha256.xor(r2_0, r2_1), r2_2);

    //   const w16 = UInt32.from(479267501)
    //   const w7 = UInt32.from(4020831841)

    //   const wi = Sha256.add(Sha256.add(Sha256.add(gamma0, w7), gamma1), w16);

    //   Circuit.asProver(() => {
    //     console.log('wi', wi.toString());
    //   })

    // } catch (error) {
    //   console.log(error)
    // }



    try {

      // const gamma0 = Sha256.xor(UInt32.from(3044724929), UInt32.from(10819768));
      // gamma0.assertEquals(UInt32.from(3051341945))

      const result = Sha256.g(h0, chunk)

    } catch (error) {
      console.error('g error', error)
    }

    console.log('g....')

    //aaa.assertEquals(0)


    // nBlocks.assertEquals(UInt32.fromNumber(1));


    // preimage.assertEquals(Field.fromNumber(2));

    //const a = Field.ofBits(preimage.toBits());
    //console.log("aa", preimage.toString())
    //console.log("aa", preimageSize.toString())


    // const b = U32.fromField(preimage);

    // b.val.assertEquals(Field.fromNumber(323232323232));

    // const bits = preimage.toBits(128);

    // bits[0].toField().assertEquals(false)
    // bits[1].toField().assertEquals(true)

    // for (let index = 2; index < bits.length; index++) {
    //   bits[index].toField().assertEquals(false)
    // }


    //UInt32.fromNumber(0x428a2f98).assertEquals(UInt32.fromNumber(0x428a2f98));

    //preimage.assertEquals(Field.fromNumber(2));


  }



  static g(hprev: UInt32[], chuck: Bool[]) {

    console.log('chuck', chuck.length)

    const h0 = hprev[0]
    const h1 = hprev[1]
    const h2 = hprev[2]
    const h3 = hprev[3]
    const h4 = hprev[4]
    const h5 = hprev[5]
    const h6 = hprev[6]
    const h7 = hprev[7]


    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2].map(n => UInt32.fromNumber(n));

    const W: UInt32[] = [];

    for (let i = 0; i < 16; i++) {
      W.push(UInt32.from(Field.ofBits(chuck.slice(i * 4 * 8, i * 4 * 8 + 4 * 8).reverse())))
    }


    for (let i = 16; i < 64; i++) {


      // Circuit.asProver(() => {
      //   console.log('wi', i, W[i - 15].toString(), W[i - 2].toString(), W[i - 16].toString(), W[i - 7].toString());
      // })



      const gamma0x = W[i - 15];

      const r1_0 = Sha256.or(Sha256.shiftL(gamma0x, 25), Sha256.shiftR(gamma0x, 7));

      const r1_1 = Sha256.or(Sha256.shiftL(gamma0x, 14), Sha256.shiftR(gamma0x, 18));

      const r1_2 = Sha256.shiftR(gamma0x, 3);


      const r01 = Sha256.xor(r1_0, r1_1);


      if( i == 37) {

        Circuit.asProver(() => {
          console.log('rrr', r01.toString(), r1_2.toString());
        })
        break;
      }

      const gamma0 = Sha256.xor(r01, r1_2);


      if( i == 37) {


        break;
      }

      // const gamma0 = (((gamma0x << 25) | (gamma0x >>> 7)) ^
      //   ((gamma0x << 14) | (gamma0x >>> 18)) ^
      //   (gamma0x >>> 3));

      const gamma1x = W[i - 2];

      const r2_0 = Sha256.or(Sha256.shiftL(gamma1x, 15), Sha256.shiftR(gamma1x, 17));

      const r2_1 = Sha256.or(Sha256.shiftL(gamma1x, 13), Sha256.shiftR(gamma1x, 19));

      const r2_2 = Sha256.shiftR(gamma1x, 10);

      const gamma1 = Sha256.xor(Sha256.xor(r2_0, r2_1), r2_2);

      const wi = Sha256.add(Sha256.add(Sha256.add(gamma0, W[i - 7]), gamma1), W[i - 16]);


      // Circuit.asProver(() => {
      //   console.log('wi', i, gamma0.toString(), gamma1.toString(), wi.toString());
      // })

      W.push(wi);


      // const gamma1 = (((gamma1x << 15) | (gamma1x >>> 17)) ^
      //   ((gamma1x << 13) | (gamma1x >>> 19)) ^
      //   (gamma1x >>> 10));
      //w.push(Field.fromNumber(0))

    }





  }


  // static lShift(u: UInt32, n: number): UInt32 {


  //   let fu = u.value;
  //   for (let index = 0; index < n; index++) {
  //     fu = fu.mul(2)
  //   }

  //   return UInt32.from(Field.ofBits(fu.toBits().slice(0, 32)))
  // }


  // static rShift(u: UInt32, n: number): UInt32 {

  //   let fu = u.value;
  //   for (let index = 0; index < n; index++) {
  //     fu = fu.div(2)
  //   }

  //   return UInt32.from(Field.ofBits(fu.toBits().slice(0, 32)))
  // }


  static add(a: UInt32, b: UInt32): UInt32 {

    const bits = a.value.add(b.value).toBits().slice(0, 32);
    return UInt32.from(Field.ofBits(bits));
  }

  static shiftR(u: UInt32, n: number): UInt32 {
    const arr = u.value.toBits(32);
    const times = n > 32 ? 32 : n;
    const bits = Field.ofBits(arr.splice(times).concat(Array(times).fill(Bool(false))));
    return UInt32.from(bits);
  }


  static shiftL(u: UInt32, n: number): UInt32 {
    const arr = u.value.toBits(32);
    const times = n > 32 ? 32 : n;
    const bits: Bool[] = Array(times).fill(Bool(false)).concat(arr.splice(0, arr.length - times));
    return UInt32.from(Field.ofBits(bits));
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

  static not(a: UInt32): UInt32 {
    let aa = a.value.toBits(32);
    return UInt32.from(Field.ofBits(aa.map(a => a.not())))
  }

  static xor(a: UInt32, b: UInt32): UInt32 {

    return Sha256.and(Sha256.or(a, b), Sha256.or(Sha256.not(a), Sha256.not(b)))
  }

}




async function main() {

  await isReady
  const kp = Sha256.generateKeypair();

  const preimage = Field.fromNumber(1);
  const preimageSize = UInt32.fromNumber(128);
  // const hash = Poseidon.hash([preimage]);
  // console.log(hash.toString())
  const pi = Sha256.prove([preimage, preimageSize], [Field.fromNumber(4)], kp);
  console.log('proof', pi);
  const success = Sha256.verify([Field.fromNumber(4)], kp.verificationKey(), pi)
  console.log('verify', success);
}


main();