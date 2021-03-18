import {Option} from "commander";
import {Blockchain} from "../Blockchains/Blockchain";
import {Kusama} from "../Blockchains/Kusama";
import {ApiPromise} from "@polkadot/api";
import {Jetski} from "./Jetski";
import {GossiperFactory} from "../Gossiper/GossiperFactory";
import {MetaData} from "../Remark/MetaData";
import {MintNft} from "../Remark/Interactions/MintNft";
import {Mint} from "../Remark/Interactions/Mint";
import {Interaction} from "../Remark/Interactions/Interaction";
import {Collection} from "../Remark/Entities/Collection";
import {Entity} from "../Remark/Entities/Entity";
import {Asset} from "../Remark/Entities/Asset";


// Verify : 6420884
// 6583396


export const startScanner = async (opts: Option)=>{

    // Launch jetski from yarn

    let chain : Blockchain;

    //@ts-ignore
    const withMeta: boolean = opts.meta;

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
    // if(withMeta){
    //     startJetskiLoop(jetski, api, currentBlock, blockNumber);
    // }else{
    //     scanWithoutMeta(jetski, api, currentBlock, blockNumber);
    // }

}




// Millord's hack for testing about meta
function scanWithoutMeta(jetski: Jetski, api: ApiPromise, currentBlock: number, blockNumber: number)
{

    console.log("WITHOUT META IN RMRK");

    // launch the loop on blocks
    let interval: NodeJS.Timeout =  setInterval(async()=>{

        let isContent: boolean = false;

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
                isContent = true;

                jetski.getBlockContent(blockNumber, api, false)
                    .then(async remarks=>{
                        isContent = true;
                        // console.log(remarks);
                        jetski.getMetadataContent(remarks)
                            .then(async(result)=>{

                                for(const rmrk of result){
                                    const gossip = new GossiperFactory(rmrk);
                                    const gossiper = await gossip.getGossiper();
                                    gossiper?.gossip();
                                }

                            }).catch(async ()=>{

                                jetski.getMetadataContent(remarks)
                                    .then(async(result)=>{
                                        for(const rmrk of result){
                                            const gossip = new GossiperFactory(rmrk);
                                            const gossiper = await gossip.getGossiper();
                                            gossiper?.gossip();
                                        }
                                    }).catch(()=>{
                                        console.error('Error with meta');
                                        process.exit();
                                });
                        })
                        blockNumber ++;

                    }).catch(e=>{

                        console.error(e);
                        console.log('Waiting for block ...');
                        setTimeout(()=>{
                            currentBlock --;
                        }, 5000);

                    });
            }
        }
        if(!isContent){
            blockNumber ++;
        }else{
            // setTimeout(()=>{console.log('Wait for meta')}, 1000);
            currentBlock = currentBlock - 50;
        }
    }, 1000 / 50)
}





async function metaDataVerifier(remarks: Array<Interaction>): Promise<Array<Interaction>>
{
    return new Promise(async (resolve)=>{

        for( const rmrk of remarks ){
            // loop for checking if meta exists
            if(rmrk instanceof Mint){

                if(rmrk.collection instanceof Collection && !rmrk.collection.metaData){
                    // if meta doesn't exists, call
                     metaDataCaller(rmrk.collection)
                         .then((meta)=>{
                             // @ts-ignore rmrk.collection is instance of Collection
                             rmrk.collection.metaData = meta;
                         }).catch(e=>{
                             console.error(e);
                     })
                }

            }else if (rmrk instanceof MintNft){

                if(rmrk.asset instanceof Asset && !rmrk.asset.metaData){
                    // if meta doesn't exists, call
                    metaDataCaller(rmrk.asset)
                        .then((meta)=>{
                            // @ts-ignore rmrk.asset is instance of Asset
                            rmrk.asset.metaData = meta;
                        }).catch((e)=>{
                            console.error(e);
                    })
                }

            }
        }
        resolve (remarks);
    })
}



async function metaDataCaller(entity: Entity, nbOfTry: number = 0): Promise<MetaData>
{
    return new Promise((resolve, reject)=>{
        if(entity.url){
            // verify url existst
            MetaData.getMetaData(entity.url)
                .then(metaData=>{
                    resolve (metaData);
                }).catch(e=>{

                if(nbOfTry < 2){
                    // try a second call meta if the first fail
                    setTimeout(()=>{
                        metaDataCaller(entity, nbOfTry++);
                    }, 500);
                }else{
                    // if 2 calls meta are failed, reject
                    reject(e);
                }

            })

        }
    })
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
                // If block scanned isn't resolved, dont increment
                currentBlock = blockNumber;

                jetski.getBlockContent(blockNumber, api, false)
                    .then(async remarks=>{
                        // Check if metadata exists
                        const rmrksWithMeta = await metaDataVerifier(remarks);

                        if(rmrksWithMeta.length > 0){
                            // Gossip if array not empty
                            for(const rmrk of rmrksWithMeta){
                                const gossip = new GossiperFactory(rmrk);
                                const gossiper = await gossip.getGossiper();
                                gossiper?.gossip();
                            }
                        }
                        blockNumber ++;
                    }).catch(e=>{
                        // If block doesn't exists, wait and try again
                        console.error(e);
                        console.log('Waiting for block ...');
                        setTimeout(()=>{
                            currentBlock --;
                        }, 5000);
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

    jetski.getBlockContent(blockN, api).then(async result=>{

        const rmrks = await metaDataVerifier(result);

        for(const rmrk of rmrks){
            const gossip = new GossiperFactory(rmrk);
            const gossiper = await gossip.getGossiper();
            gossiper?.gossip();
        }
    });
}


export const test = ()=>{
    console.log("Hello World");
}