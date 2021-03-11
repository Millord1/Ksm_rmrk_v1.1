import {Option} from "commander";
import {Blockchain} from "../Blockchains/Blockchain";
import {Kusama} from "../Blockchains/Kusama";
import {ApiPromise} from "@polkadot/api";
import {Jetski} from "./Jetski";
import {Mint} from "../Remark/Interactions/Mint";


export const startScanner = async (opts: Option)=>{

    let chain : Blockchain;

    //@ts-ignore
    switch(opts.chain.toLowerCase()){

        case"kusama":
        default:
            chain = new Kusama();
            break;

    }

    // @ts-ignore
    let blockNumber = opts.block;

    const jetski = new Jetski(chain);
    let api: ApiPromise = await jetski.getApi();

    setInterval(async()=>{

        jetski.getBlockContent(blockNumber, api).then(r=>{
            if(r.length > 0){
                console.log(r);
                process.exit();
            }
        }).catch(e=>{
            console.error(e);
        });

        blockNumber ++;

    }, 1000 / 20)

}


export const scan = async (opts: Option)=>{
    let chain : Blockchain = new Kusama();
    const jetski = new Jetski(chain);

    const api: ApiPromise = await jetski.getApi();

    // @ts-ignore
    const blockN: number = opts.block;

    jetski.getBlockContent(blockN, api).then(result=>{
        for(const rmrk of result){
            console.log(rmrk);
        }
    });
}


export const test = ()=>{
    console.log("Hello World");
}