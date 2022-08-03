import {
    Field,
    SmartContract,
    state,
    State,
    method,
    DeployArgs,
    Permissions,
  } from 'snarkyjs';
  
  export class HelloWorld extends SmartContract {
    @state(Field) some_var: State<Field> = State<Field>();

    deploy(args: DeployArgs) {
        super.deploy(args);
    }

    @method init() {
        this.some_var.set(Field(3));

        this.setPermissions({
            ...Permissions.default(),
            editState: Permissions.proofOrSignature(),
          });
    }

    @method update(squared: Field) {
        this.some_var.get().square().assertEquals(squared); // some_var^2 = squared
        this.some_var.set(squared); // some_var ← squared
    }

}