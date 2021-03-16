import {Entity} from "../Remark/Entities/Entity";
import {Asset} from "../Remark/Entities/Asset";
import {Collection} from "../Remark/Entities/Collection";


export class EntityGossiper
{

    private entityName: string;

    private collectionId: string;
    private image: string;
    private description: string;
    private blockId: number;


    constructor(entity: Entity, blockId: number) {

        this.entityName = entity.constructor.name;

        // use instanceof for typescript typing
        if(entity instanceof Asset){
            this.collectionId = entity.token.contractId;
        }else if (entity instanceof Collection){
            this.collectionId = entity.collectionId
        }else{
            this.collectionId = "";
        }

        this.image = entity.metaData?.image ? entity.metaData?.image : "";
        this.description = entity.metaData?.description ? entity.metaData.description : "";
        this.blockId = blockId;
    }



}