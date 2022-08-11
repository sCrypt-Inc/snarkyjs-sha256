

import {
  Field,
  Circuit,
  circuitMain,
  public_,
  isReady,
  UInt32,
  Bool,
  shutdown,
  Proof
} from 'snarkyjs';

class Rotater extends Circuit {
  @circuitMain
  static main(x: Field, @public_ y: Field) {

    Rotater.rotateR(UInt32.from(8), 3).assertEquals(UInt32.from(1));
    Rotater.rotateR(UInt32.from(8), 2).assertEquals(UInt32.from(2));
    Rotater.rotateR(UInt32.from(8), 1).assertEquals(UInt32.from(4));

    // 1 >>> 1 == 2 >>> 2 == 4 >>> 3 == 8 >>> 4 == 1 ^ 31
    Rotater.rotateR(UInt32.from(1), 1).assertEquals(UInt32.from(2147483648));
    Rotater.rotateR(UInt32.from(2), 2).assertEquals(UInt32.from(2147483648));
    Rotater.rotateR(UInt32.from(4), 3).assertEquals(UInt32.from(2147483648));
    Rotater.rotateR(UInt32.from(8), 4).assertEquals(UInt32.from(2147483648));

    Rotater.rotateL(UInt32.from(1), 1).assertEquals(UInt32.from(2));
    Rotater.rotateL(UInt32.from(1), 2).assertEquals(UInt32.from(4));
    Rotater.rotateL(UInt32.from(1), 3).assertEquals(UInt32.from(8));

    Rotater.rotateL(UInt32.from(2147483648), 1).assertEquals(UInt32.from(1));
    Rotater.rotateL(UInt32.from(2147483648), 2).assertEquals(UInt32.from(2));
    Rotater.rotateL(UInt32.from(2147483648), 3).assertEquals(UInt32.from(4));
    Rotater.rotateL(UInt32.from(2147483648), 4).assertEquals(UInt32.from(8));

    x.assertGte(0);
    y.assertGte(0);
  }

  static rotateR(x: UInt32, n: number): UInt32 {
    if (n < 0 || n > 31) {
      throw Error('invalid n for rotateR: ' + n);
    }
    let bits: Bool[] = [];
    let x_ = x.value.toBits(32);
    for (let i = 0; i < 32; i++) {
      let idx = n + i;
      if (idx > 31) {
        idx = idx - 32;
      }
      bits.push(x_[idx]);
    }
    // Circuit.asProver(() => {
    //   console.log('bits: ', bits);
    //   console.log('x_: ', x_);
    // })
    return UInt32.from(Field.ofBits(bits));
  }

  static rotateL(x: UInt32, n: number): UInt32 {
    if (n < 0 || n > 31) {
      throw Error('invalid n for rotateR: ' + n);
    }
    let bits: Bool[] = [];
    let x_ = x.value.toBits(32);
    for (let i = 0; i < 32; i++) {
      let idx = i - n;
      if (idx < 0) {
        idx = idx + 32;
      }
      bits.push(x_[idx]);
    }
    // Circuit.asProver(() => {
    //   console.log('bits: ', bits);
    //   console.log('x_: ', x_);
    // })
    return UInt32.from(Field.ofBits(bits));
  }
}


async function main() {

  await isReady

  try {
    const kp = Rotater.generateKeypair();

    const x = Field.fromNumber(1);
    const y = Field.fromNumber(1);
  
    const pi = Rotater.prove([x], [y], kp);
    console.log('proof', pi);

    const success = Rotater.verify([y], kp.verificationKey(), pi)
    console.log('verify', success);
  
  } catch (error) {
    console.log(error)
  }

  shutdown();
}


main();