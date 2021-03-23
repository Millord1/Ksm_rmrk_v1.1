import {CollectionInterface, NftInterface} from "./Interactions/Interaction";

export class VersionChecker
{

   private readonly version: string;

   constructor(version: string) {
        this.version = this.findVersion(version);
   }


   private findVersion(version: string): string
   {
       if(version.includes("1.0.0")){
           return "1.0.0";
       }
       return "";
   }


    public checkAssetVersion(data: NftInterface): boolean
    {
        if(this.version == "1.0.0"){
            return this.assetVOne(data);
        }else{
            return false;
        }
    }


    public checkCollectionVersion(data: CollectionInterface): boolean
    {
        if(this.version == "1.0.0"){
            return this.collectionVOne(data);
        }else{
            return false;
        }
    }


    private collectionVOne(data: CollectionInterface): boolean
    {
        return !Number.isNaN(data.max);
    }


    private assetVOne(data: NftInterface): boolean
    {
        const computed = data.contractId.split('-');

        if(computed.length != 4){
            return false;
        }else{
            if(Number.isNaN(computed[0])){
                return false;
            }
        }

        if(data.instance.includes('-')){
            return false;
        }

        return !Number.isNaN(data.sn);
    }






}