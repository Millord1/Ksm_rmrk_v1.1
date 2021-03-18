import {Interaction} from "../Remark/Interactions/Interaction";
import {EntityGossiper} from "./EntityGossiper";
import {Mint} from "../Remark/Interactions/Mint";
import {Send} from "../Remark/Interactions/Send";
import {EventGossiper} from "./EventGossiper";
import {Buy} from "../Remark/Interactions/Buy";
import {MintNft} from "../Remark/Interactions/MintNft";
import {Asset} from "../Remark/Entities/Asset";


export class GossiperFactory
{

    private readonly rmrk: Interaction;

    constructor(rmrk: Interaction) {
        this.rmrk = rmrk;
    }


    public async getGossiper()
    {
        // use instanceof for typescript typing
        if(this.rmrk instanceof Mint){

            const entity = this.rmrk.collection ? this.rmrk.collection : undefined;
            if(entity){
                return new EntityGossiper(entity, this.rmrk.transaction.blockId);
            }
            return undefined;

        }else if(this.rmrk instanceof Send || this.rmrk instanceof Buy){

            return new EventGossiper(this.rmrk);

        }else if(this.rmrk instanceof MintNft){

            const mintNft: MintNft = this.rmrk;



            let asset: Asset;
            if(this.rmrk.asset){
                asset = this.rmrk.asset;
            }else{
                return undefined
            }

            const entity = new EntityGossiper(asset, this.rmrk.transaction.blockId);
            await entity.gossip();

            return new EventGossiper(mintNft);
        }

        return undefined;
    }



}