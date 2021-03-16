import {Interaction} from "../Remark/Interactions/Interaction";
import {EntityGossiper} from "./EntityGossiper";
import {Mint} from "../Remark/Interactions/Mint";
import {Send} from "../Remark/Interactions/Send";
import {EventGossiper} from "./EventGossiper";
import {Buy} from "../Remark/Interactions/Buy";
import {MintNft} from "../Remark/Interactions/MintNft";


export class GossiperFactory
{

    private rmrk: Interaction;

    constructor(rmrk: Interaction) {
        this.rmrk = rmrk;
    }


    public getGossiper()
    {

        if(this.rmrk instanceof Mint){

            const entity = this.rmrk.collection ? this.rmrk.collection : undefined;
            if(entity){
                return new EntityGossiper(entity, this.rmrk.transaction.blockId);
            }
            return undefined;

        }else if(this.rmrk instanceof Send || this.rmrk instanceof Buy){

            return new EventGossiper(this.rmrk);

        }else if(this.rmrk instanceof MintNft){

            // TODO

        }

        return undefined;
    }



}