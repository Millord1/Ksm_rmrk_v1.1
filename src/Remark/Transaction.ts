import {Blockchain} from "../Blockchains/Blockchain";

export class Transaction
{
    public blockId: number;
    public txHash: string;
    public timestamp: string;
    public source: string;
    public destination?: string;
    public chain: Blockchain;

    constructor(
        blockId: number,
        txHash: string,
        timestamp: string,
        chain: Blockchain,
        source: string,
        destination?: string
    ){

        this.blockId = blockId;
        this.txHash = txHash;
        this.timestamp = timestamp;
        this.source = source;
        this.chain = chain;

        // TODO add default Mint of Sandra
        if(destination === undefined){
            this.destination = '0x0';
        }else{
            this.destination = destination;
        }

    }
}