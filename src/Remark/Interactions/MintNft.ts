import {Interaction, NftInterface} from "./Interaction";
import {Asset} from "../Entities/Asset";
import {Blockchain} from "../../Blockchains/Blockchain";
import {Transaction} from "../Transaction";


export class MintNft extends Interaction
{

    public asset?: Asset;

    constructor(rmrk: string, chain: Blockchain, transaction: Transaction) {
        super(rmrk, chain, transaction);

        const asset = this.nftFromMintNft();
        if(asset){
            this.asset = asset;
        }
    }


    private nftFromMintNft(): Asset|null
    {
        const rmrkData = this.splitRmrk();

        const version: string = rmrkData[2];

        let nftData: NftInterface;

        try{
            nftData = JSON.parse(rmrkData[rmrkData.length-1]);
        }catch(e){
            console.log(e);
            return null
        }

        nftData = this.getComputedId(nftData);

        return new Asset(this.rmrk, this.chain, nftData, version);
    }

}