

import {
    Field,
    Circuit,
    circuitMain,
    public_,
    isReady,
    CircuitString
  } from 'snarkyjs';
  
  /* Exercise 1:
  Public input: a hash value h
  Prove:
    I know a value x < 2^32 such that hash(x) = h 
  */
  
  class Counter extends Circuit {
    @circuitMain
    static increase( counter: CircuitString, @public_ newCounter: Field) {


        let acc = counter.append(CircuitString.fromString("aaaaa"));


         
        for (let i = 0; i < 1; i++) {
          
          acc = acc.append(CircuitString.fromString("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"))
          
        }

        //a.assertEquals(newCounter)

    }
  }
  

  async function main() {

    await isReady


    console.log('main...')


    const kp = Counter.generateKeypair();

    console.log('generateKeypair ok' )
  
    // const counter = CircuitString.fromString("aaaaa");
    // const newCounter = Field.fromNumber(2);
  
    // const pi = Counter.prove([counter], [newCounter], kp);
    // console.log('proof', pi);

    // const success = Counter.verify([newCounter], kp.verificationKey(), pi)
    // console.log('verify', success);
  }


  main();