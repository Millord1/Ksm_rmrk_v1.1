import {Remark} from "../Remark";
import {Blockchain} from "../../Blockchains/Blockchain";
import {Transaction} from "../Transaction";


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



    public getComputedId(nftData: NftInterface): NftInterface
    {
        nftData.computedId = this.transaction.blockId + '-' + nftData.collection + '-' + nftData.instance + '-' + nftData.name;
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

        return nft;

    }


    private static nftFromComputedVOne(rmrkArray: Array<string>)
    {
        // Transform computed ID to NftInterface with v1.0.0 compatibility

        const isComputed = rmrkArray.pop();
        let computedId: string = "";

        if(typeof isComputed == "string"){
            computedId = isComputed;
        }

        try{
            const assetData: Array<string> = computedId.split('-');

            return {
                collection: assetData[1],
                sn: assetData[4],
                name: assetData[3],
                metadata: "",
                currentOwner: "",
                instance: assetData[2],
                computedId: computedId
            };

        }catch(e){
            console.error(e);
            return undefined;
        }
    }


}