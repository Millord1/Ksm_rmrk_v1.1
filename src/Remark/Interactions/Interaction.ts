import {Remark} from "../Remark";
import {Blockchain} from "../../Blockchains/Blockchain";
import {Transaction} from "../Transaction";
import {Entity} from "../Entities/Entity";


export interface NftInterface
{
    collection: string,
    sn: string,
    transferable: boolean,
    name: string,
    metadata: string,
    currentOwner: string,
    instance: string,
    contractId: string
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



    public addComputedId(nftData: NftInterface): NftInterface
    {
        // nftData.contractId = this.transaction.blockId + '-' + nftData.collection + '-' + nftData.instance + '-' + nftData.name;
        nftData.contractId = this.transaction.blockId + '-' + nftData.collection + '-' + nftData.instance;
        return nftData;
    }


    protected slugifyCollectionObj(colelctionData: CollectionInterface)
    {
        for(let [key, value] of Object.entries(colelctionData)){
            if(typeof value == "string"){
                value = Entity.slugification(value);
            }
        }

        return colelctionData;
    }


    protected slugifyNftObj(nftData: NftInterface)
    {
        for(let [key, value] of Object.entries(nftData)){
            if(typeof value == "string"){
                value = Entity.slugification(value);
            }
        }

        return nftData;
    }


    public splitRmrk(): Array<string>
    {
        return this.rmrk.split('::');
    }



    protected assetFromComputedId(rmrkArray: Array<string>): NftInterface|undefined
    {
        // Return NftInterface from computedId, depending version of remmark

        const version: string = rmrkArray[2];

        let nft: NftInterface|undefined = undefined;

        if(version.includes("1.0.0") || this.version.includes("1.0.0")){
            nft = Interaction.nftFromComputedVOne(rmrkArray);
        }

        if(nft){
            nft = this.slugifyNftObj(nft);
        }

        return nft;

    }


    private static nftFromComputedVOne(rmrkArray: Array<string>): NftInterface|undefined
    {
        // Transform computed ID to NftInterface with v1.0.0 compatibility

        const isComputed = rmrkArray.pop();
        let computedId: string = "";

        if(typeof isComputed == "string"){
            computedId = isComputed;
        }

        const assetData: Array<string> = computedId.split('-');

        if(assetData.length != 5 || Number.isNaN(assetData[4]) || Number.isNaN(assetData[0])){
            return undefined;
        }

        const sn: string = assetData[4];

        if(computedId.includes(sn)){
            // delete sn from computedID
            computedId = computedId.replace('-'+sn, "");
        }

        try{

            return {
                collection: assetData[1],
                sn: sn,
                transferable: true,
                name: assetData[3],
                metadata: "",
                currentOwner: "",
                instance: assetData[2],
                contractId: computedId
            };

        }catch(e){
            console.error(e);
            return undefined;
        }
    }


}