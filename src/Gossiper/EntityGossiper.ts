import {Entity} from "../Remark/Entities/Entity";
import {Asset} from "../Remark/Entities/Asset";
import {Collection} from "../Remark/Entities/Collection";
import {Jetski} from "../Jetski/Jetski";
import {CSCanonizeManager} from "canonizer/src/canonizer/CSCanonizeManager";
import {KusamaBlockchain} from "canonizer/src/canonizer/Kusama/KusamaBlockchain";
import {RmrkContractStandard} from "canonizer/src/canonizer/Interfaces/RmrkContractStandard";
import {MetaData} from "../Remark/MetaData";

export class EntityGossiper
{

    private entityName: string;

    private readonly image: string;
    private readonly description: string;
    private readonly blockId: number;

    private readonly collectionId: string;

    private readonly collection?: string;

    private readonly assetId?: string;
    private readonly assetName?: string;

    constructor(entity: Entity, blockId: number) {

        this.entityName = entity.constructor.name;

        // use instanceof for typescript typing
        if(entity instanceof Asset){

            this.collectionId = entity.token.collectionId;
            this.assetId = entity.contractId;
            this.assetName = entity.name;

        }else if (entity instanceof Collection){

            this.collectionId = entity.contract.id;
            this.collection = entity.contract.collection;

        }else{
            this.collectionId = "";
        }

        this.image = entity.metaData?.image ? MetaData.getCloudFlareUrl(entity.metaData?.image) : "";
        this.description = entity.metaData?.description ? entity.metaData.description : "No description";
        this.blockId = blockId;
    }



    public async gossip()
    {

        const jwt = Jetski.getJwt();

        const canonizeManager = new CSCanonizeManager({connector:{gossipUrl:'http://arkam.everdreamsoft.com/alex/gossip',jwt:jwt}});
        const sandra = canonizeManager.getSandra();
        const kusama = new KusamaBlockchain(sandra);

        switch(this.entityName.toLowerCase()){

            case 'asset':

                let assetId: string = "";
                if(this.assetId){
                    assetId = this.assetId
                }

                let assetName: string = "";
                if(this.assetName){
                    assetName = this.assetName;
                }

                let assetContract = kusama.contractFactory.getOrCreate(assetId);

                let myAsset = canonizeManager.createAsset({assetId: assetId, imageUrl: this.image,description:this.description, name:assetName});
                let myCollection = canonizeManager.createCollection({id: this.collectionId});

                myAsset.bindCollection(myCollection);
                assetContract.bindToCollection(myCollection);

                let rmrkToken = new RmrkContractStandard(canonizeManager);
                assetContract.setStandard(rmrkToken);

                myAsset.bindContract(assetContract);

                canonizeManager.gossipOrbsBindings().then(()=>{console.log("asset gossiped " + this.blockId)});

                break;


            case 'collection':

                let collection: string = "";
                if(this.collection){
                    collection = this.collection;
                }

                let myContract = kusama.contractFactory.getOrCreate(this.collectionId);

                let canonizeCollection = canonizeManager.createCollection({id: this.collectionId, imageUrl: this.image, name: collection, description: this.description});

                myContract.bindToCollection(canonizeCollection);

                canonizeManager.gossipCollection().then(()=>{console.log("collection gossiped " + this.blockId)});

                break;


            default:
                console.error('Something is wrong with Entity Gossip of ' + this.blockId);
                break;
        }

    }


}