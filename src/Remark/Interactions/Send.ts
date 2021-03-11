import {Interaction, NftInterface} from "./Interaction";
import {Asset} from "../Entities/Asset";
import {Blockchain} from "../../Blockchains/Blockchain";
import {Transaction} from "../Transaction";


export class Send extends Interaction
{

    public asset: Asset;

    constructor(rmrk: string, chain: Blockchain, transaction: Transaction) {
        super(rmrk, chain, transaction);
        this.asset = this.assetToSend();
    }


    private assetToSend()
    {

        const rmrkArray: Array<string> = this.splitRmrk();
        const isReceiver = rmrkArray.pop();

        if(typeof isReceiver == "string"){
            this.transaction.destination = isReceiver;
        }

        const isComputed = rmrkArray.pop();
        let computedId: string = "";

        if(typeof isComputed == "string"){
            computedId = isComputed;
        }

        const assetData: Array<string> = computedId.split('-');

        const asset: NftInterface = {
            collection: assetData[1],
            sn: assetData[4],
            name: assetData[3],
            metadata: "",
            currentOwner: "",
            instance: assetData[2],
            computedId: computedId
        };

        return new Asset(this.rmrk, this.chain, asset);
    }

}