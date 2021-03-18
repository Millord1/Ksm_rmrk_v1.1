import {Blockchain} from "./Blockchain";


export class WestEnd extends Blockchain{
    public constructor() {
        super("Westend", "WE", "", true, "wss://westend-rpc.polkadot.io");
    }
}