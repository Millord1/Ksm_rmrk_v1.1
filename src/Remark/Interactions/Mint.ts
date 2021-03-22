import {CollectionInterface, Interaction} from "./Interaction";
import {Collection} from "../Entities/Collection";
import {Blockchain} from "../../Blockchains/Blockchain";
import {Transaction} from "../Transaction";
import {Entity} from "../Entities/Entity";


export class Mint extends Interaction
{

    public collection?: Collection;

    public constructor(rmrk: string, chain: Blockchain, transaction: Transaction) {
        super(rmrk, chain, transaction);

        const collection : Collection|null = this.collectionFromRmrk();

        if(collection){
            this.collection = collection;
        }
    }


    private collectionFromRmrk(): Collection|null
    {

        const rmrk = this.splitRmrk();

        let mintData: CollectionInterface

        try{
            mintData = JSON.parse(rmrk[rmrk.length-1]);
        }catch(e){
            console.log(e);
            return null;
        }

        mintData = this.slugifyCollectionObj(mintData);

        return new Collection(this.rmrk, this.chain, mintData);
    }

}