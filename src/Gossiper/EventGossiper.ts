
import {Send} from "../Remark/Interactions/Send";
import {MintNft} from "../Remark/Interactions/MintNft";
import {Buy} from "../Remark/Interactions/Buy";


export class EventGossiper
{

    private interaction: string;

    private collectionId: string;
    private sn: string;
    private signer: string;
    private receiver: string;
    private blockId: number;
    private timestamp: string;
    private txId: string;


    constructor(remark: Send|MintNft|Buy) {
        this.interaction = remark.constructor.name.toLowerCase();
        this.collectionId = remark.asset ? remark.asset.assetId : "";
        this.sn = remark.asset ? remark.asset.token.sn : "";
        this.signer = remark.transaction.source;
        this.receiver = remark.transaction.destination ? remark.transaction.destination : "";
        this.blockId = remark.transaction.blockId;
        this.timestamp = remark.transaction.timestamp;
        this.txId = remark.transaction.txHash;
    }

    public gossipEvent()
    {



    }

}