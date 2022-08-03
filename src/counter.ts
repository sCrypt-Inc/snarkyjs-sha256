

import {
    Field,
    Circuit,
    circuitMain,
    public_,
    isReady,
  } from 'snarkyjs';
  
  /* Exercise 1:
  Public input: a hash value h
  Prove:
    I know a value x < 2^32 such that hash(x) = h 
  */
  
  class Counter extends Circuit {
    @circuitMain
    static increase( counter: Field, @public_ newCounter: Field) {


        const a = counter.add(1);

        a.assertEquals(newCounter)

    }
  }
  

  async function main() {

    await isReady

    const kp = Counter.generateKeypair();
  
    const counter = Field.fromNumber(1);
    const newCounter = Field.fromNumber(2);
  
    const pi = Counter.prove([counter], [newCounter], kp);
    console.log('proof', pi);

    const success = Counter.verify([newCounter], kp.verificationKey(), pi)
    console.log('verify', success);
  }


  main();