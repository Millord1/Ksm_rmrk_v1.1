import {Blockchain} from "./Blockchain";

export class Kusama extends Blockchain
{

    public constructor() {
        super('Kusama', "KSM", "", true, "wss://kusama-rpc.polkadot.io/");
    }

}