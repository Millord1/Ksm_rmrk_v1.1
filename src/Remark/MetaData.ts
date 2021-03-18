import {Entity} from "./Entities/Entity";


const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


interface MetadataInputs
{
    external_url: string;
    image: string;
    description: string;
    name: string;
    attributes: Array<Object>;
    background_color: string;
    animation_url: string;
}


export class MetaData
{

    public url: string;
    public external_url: string = "";
    public image: string = "";
    public description: string = "";
    public name: string = "";
    public attributes: Array<Object> = [];
    public background_color: string = "";

    private static ipfsUrl: string = "https://ipfs.io/ipfs/";
    private static delayForCalls: number = 1000;

    constructor(url: string, data: MetadataInputs) {
        this.url = url;
        this.external_url = data.external_url;
        this.description = data.description != undefined ? Entity.slugification(data.description) : data.description;
        this.name = data.name != undefined ? Entity.slugification(data.name) : data.name;
        this.background_color = data.background_color;
        this.attributes = data.attributes;
        this.image = data.image != "" ? data.image : data.animation_url;
    }


    private static getCorrectUrl(url: string): string
    {
        // Modify the url for ipfs calls

        const urls: Array<string> = url.split('/');
        const shortUrl = urls.pop();

        if(urls.includes('ipfs')){
            return this.ipfsUrl + shortUrl;
        }else{
            return url;
        }

    }



    public static getCloudFlareUrl(url: string): string
    {
        const urls: Array<string> = url.split('/');
        const shortUrl = urls.pop();

        if(urls.includes('ipfs')){
            return "https://cloudflare-ipfs.com/ipfs/" + shortUrl;
        }else{
            return url;
        }
    }


    public static async getMetaData(url: string, batchIndex?: number): Promise<MetaData>
    {
        let timeToWait: number = 100;
        // Use array index for increment the time out

        if(batchIndex && batchIndex != 0){
            timeToWait = batchIndex * this.delayForCalls;
        }

        url = this.getCorrectUrl(url);
        console.log(url);
        return new Promise((resolve, reject)=>{

            const request = new XMLHttpRequest();
            let response: MetadataInputs;

            setTimeout(()=>{

                request.open("GET", url);
                request.send();

                request.onreadystatechange = function(){

                    if(this.readyState == 4 && this.status == 200){

                        try{
                            // Try to create a MetadataInputs with parsing
                            response = JSON.parse(this.responseText);

                        }catch(e){
                            // return empty object
                            response = {
                                external_url : "",
                                image : "",
                                description : "",
                                name : "",
                                attributes : [],
                                background_color : "",
                                animation_url : ""
                            };
                            console.error(e.message + "\n for the MetaData url : " + url);
                        }

                        resolve (new MetaData(url, response));

                    }else if(this.readyState == 4 && this.status == 404){
                        reject ('request : ' + this.status);
                    }else if(this.readyState == 4 && this.status == 400){
                        reject('Bad url : ' + url);
                    }else if(this.readyState == 4 && this.status == 500){
                        reject('Something is bad with this request, error ' + this.status);
                    }

                }

            }, timeToWait)

        })

    }


}