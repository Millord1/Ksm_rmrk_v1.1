import {Remark} from "../Remark";
import {Blockchain} from "../../Blockchains/Blockchain";
import {Transaction} from "../Transaction";
import {Asset} from "../Entities/Asset";
import {Collection} from "../Entities/Collection";


export interface NftInterface
{
    collection: string,
    sn: string,
    name: string,
    metadata: string,
    currentOwner: string,
    instance: string,
    computedId: string
}


export interface CollectionInterface
{
    id: string,
    symbol: string,
    issuer: string,
    version: string,
    name: string,
    max: number,
    metadata: string
}

export abstract class Interaction extends Remark
{

    public transaction: Transaction;

    protected constructor(rmrk: string, chain: Blockchain, transaction: Transaction, version?: string)
    {
        super(rmrk, chain, version);
        this.transaction = transaction;
    }

    public getComputedId(nftData: NftInterface)
    {
        nftData.computedId = this.transaction.blockId + '-' + nftData.collection + '-' + nftData.instance + '-' + nftData.name;
        return nftData;
    }

    public splitRmrk(){
        return this.rmrk.split('::');
    }

}