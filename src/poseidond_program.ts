import {
  Poseidon,
  Field,
  Circuit,
  circuitMain,
  public_,
  SelfProof, ZkProgram, verify,
  isReady,
  shutdown
} from 'snarkyjs';


//console.log('Main verify ok?', ok);

class Poseidond extends Circuit {
  @circuitMain
  static increase( preimage: Field, @public_ hash: Field) {

    Poseidond.main(preimage).assertEquals(hash);

  }

  static main(preimage: Field) :  Field {
    return Poseidon.hash([Poseidon.hash([preimage])]);
  }
}

let PoseidondProgram = ZkProgram({
  publicInput: Field,

  methods: {
    baseCase: {
      privateInputs: [],

      method(publicInput: Field) {
        publicInput.assertEquals(Field(3717409890));
      },
    },

    inductiveCase: {
      privateInputs: [SelfProof],

      method(publicInput: Field, earlierProof: SelfProof<Field>) {
        earlierProof.verify();
        Poseidond.main(earlierProof.publicInput).assertEquals(publicInput);
      },
    },
  },
});


async function main() {


  const preimage = Field(3717409890)

  console.log('preimage', preimage.toString()); 
  
  let MyProof = ZkProgram.Proof(PoseidondProgram);

  console.log('program digest', PoseidondProgram.digest());
  
  console.log('compiling MyProgram...');
  let { verificationKey } = await PoseidondProgram.compile();
  console.log('verification key', verificationKey.slice(0, 10) + '..');
  
  console.log('proving base case...');
  let proof = await PoseidondProgram.baseCase(preimage);
  //proof = testJsonRoundtrip(proof);
  
  console.log('verify...');
  let ok = await verify(proof, verificationKey);
  console.log('ok?', ok);
  
  console.log('proving step 1...');
  const hash1 = Poseidon.hash([Poseidon.hash([preimage])]);
  
  console.log('hash1', BigInt(hash1.toString()).toString(16));
  proof = await PoseidondProgram.inductiveCase(hash1, proof);
  console.log('verify alternative...');
  ok = await PoseidondProgram.verify(proof);
  console.log('ok (alternative)?', ok);
  
  console.log('proving step 2...');
  const hash2 = Poseidon.hash([Poseidon.hash([hash1])])
  
  console.log('hash2', BigInt(hash2.toString()).toString(16));
  proof = await PoseidondProgram.inductiveCase(hash2, proof);
  console.log('verify alternative...');
  ok = await PoseidondProgram.verify(proof);
  console.log('ok (alternative)?', ok);
  
  
  console.log('proving step 3...');
  const hash3 = Poseidon.hash([Poseidon.hash([hash2])])
  
  console.log('hash3', BigInt(hash3.toString()).toString(16));
  proof = await PoseidondProgram.inductiveCase(hash3, proof);
  console.log('verify alternative...');
  ok = await PoseidondProgram.verify(proof);
  console.log('ok (alternative)?', ok);
  
  
  console.log('proving step 4...');
  const hash4 = Poseidon.hash([Poseidon.hash([hash3])])
  
  console.log('hash4', BigInt(hash4.toString()).toString(16));
  proof = await PoseidondProgram.inductiveCase(hash4, proof);
  console.log('verify alternative...');
  ok = await PoseidondProgram.verify(proof);
  console.log('ok (alternative)?', ok);

  await shutdown();
}




try {
  await isReady
  await main();
} catch (error) {
  console.log(error)
}
