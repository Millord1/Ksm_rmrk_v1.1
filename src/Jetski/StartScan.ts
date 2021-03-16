import {Option} from "commander";
import {Blockchain} from "../Blockchains/Blockchain";
import {Kusama} from "../Blockchains/Kusama";
import {ApiPromise} from "@polkadot/api";
import {Jetski} from "./Jetski";
import {Mint} from "../Remark/Interactions/Mint";
import {GossiperFactory} from "../Gossiper/GossiperFactory";



export const startScanner = async (opts: Option)=>{

    // Launch jetski from yarn

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

    let currentBlock: number = 0;

    startJetskiLoop(jetski, api, currentBlock, blockNumber);

}




function startJetskiLoop(jetski: Jetski, api: ApiPromise, currentBlock: number, blockNumber: number)
{
    // launch the loop on blocks
    let interval: NodeJS.Timeout =  setInterval(async()=>{

        if (!api.isConnected) {
            // if Api disconnect
            clearInterval(interval);
            console.log('API is disconnected, waiting for reconnect...');

            api = await jetski.getApi();
            console.log('API reconnected, loop will now restart');

            startJetskiLoop(jetski, api, --currentBlock, blockNumber);

        }else{

            if(currentBlock != blockNumber){
                currentBlock = blockNumber;

                jetski.getBlockContent(blockNumber, api)
                    .then(remarks=>{
                        if(remarks.length > 0){
                            for(const rmrk of remarks){
                                const gossip = new GossiperFactory(rmrk);
                                const gossiper = gossip.getGossiper();
                                gossiper?.gossip();
                            }
                        }
                        blockNumber ++;
                    }).catch(e=>{
                        console.error(e);
                        console.log('Waiting for block ...');
                        setTimeout(()=>{
                            currentBlock --;
                        }, 10000);
                    });
            }
        }
    }, 1000 / 50)
}




export const scan = async (opts: Option)=>{
    // scan only one block

    let chain : Blockchain = new Kusama();
    const jetski = new Jetski(chain);

    const api: ApiPromise = await jetski.getApi();

    // @ts-ignore
    const blockN: number = opts.block;

    jetski.getBlockContent(blockN, api).then(result=>{
        for(const rmrk of result){
            const gossip = new GossiperFactory(rmrk);
            const gossiper = gossip.getGossiper();
            gossiper?.gossip();
        }
    });
}


export const test = ()=>{
    console.log("Hello World");
}