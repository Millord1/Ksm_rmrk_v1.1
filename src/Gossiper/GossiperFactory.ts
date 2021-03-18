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
        // Dispatch for gossiper
        if(this.rmrk instanceof Mint){

            if(this.rmrk.collection){
                return new EntityGossiper(this.rmrk.collection, this.rmrk.transaction.blockId);
            }
            return undefined;

        }else if(this.rmrk instanceof Send || this.rmrk instanceof Buy){

            if(this.rmrk.asset){
                return new EventGossiper(this.rmrk);
            }
            return undefined;

        }else if(this.rmrk instanceof MintNft){

            const mintNft: MintNft = this.rmrk;

            if(!this.rmrk.asset){
                return undefined
            }

            const entity = new EntityGossiper(this.rmrk.asset, this.rmrk.transaction.blockId);
            await entity.gossip();

            return new EventGossiper(mintNft);
        }

        return undefined;
    }



}