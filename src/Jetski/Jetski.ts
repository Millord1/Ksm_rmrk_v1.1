import {Blockchain} from "../Blockchains/Blockchain";
import {ApiPromise, WsProvider} from '@polkadot/api';
import {Interaction} from "../Remark/Interactions/Interaction";
import {Transaction} from "../Remark/Transaction";
import {hexToString} from "@polkadot/util";
import {RmrkReader} from "./RmrkReader";
import {MetaData} from "../Remark/MetaData";
import {Mint} from "../Remark/Interactions/Mint";
import {Entity} from "../Remark/Entities/Entity";
import {MintNft} from "../Remark/Interactions/MintNft";


export class Jetski
{

    public chain: Blockchain;
    private wsProvider: WsProvider;


    constructor(chain: Blockchain) {
        this.chain = chain;
        this.wsProvider = new WsProvider(this.chain.wsProvider);
    }


    public async getApi(): Promise<ApiPromise>
    {
        let api: ApiPromise;
        api = await ApiPromise.create({provider: this.wsProvider});
        return api;
    }


    public async getBlockContent(blockNumber: number, api: ApiPromise): Promise<Array<Interaction>>
    {

        return new Promise(async (resolve, reject)=>{

            let blockRmrk: Array<Promise<Interaction|string>> = [];

            let blockHash: any;

            try{
                blockHash = await api.rpc.chain.getBlockHash(blockNumber);
            }catch(e){
                // console.log(e);
                reject('No Block');
            }

            const block = await api.rpc.chain.getBlock(blockHash);

            let blockId = blockNumber;
            let blockTimestamp: string = "";

            if(block.block == null){
                reject(null);
            }

            for (const ex of block.block ? block.block.extrinsics : []){

                const { method: {
                    args, method, section
                } } = ex;

                if(section === "timestamp" && method === "set"){
                    blockTimestamp = Jetski.getTimestamp(ex);
                }

                const dateTimestamp = Number(blockTimestamp) * 1000;
                const date = new Date(dateTimestamp);

                console.log('block ' + blockNumber + ' ' + date);


                if(section === "system" && method === "remark"){

                    const remark = args.toString();
                    const signer = ex.signer.toString();
                    const hash = ex.hash.toHex();

                    const tx = new Transaction(blockId, hash, blockTimestamp, this.chain, signer);

                    if(remark.indexOf("") === 0){
                        // const buildRemark = await this.rmrkToObject(remark, tx);
                        blockRmrk.push(this.getObjectFromRemark(remark, tx));
                    }
                }


                if(section === "utility" && method === "batch"){

                    const arg = args.toString();
                    const batch = JSON.parse(arg);

                    const signer = ex.signer.toString();
                    const hash = ex.hash.toHex();

                    let i = 1;

                    for (const rmrkObj of batch){

                        const txHash = hash + '-' + i;

                        const tx = new Transaction(blockId, txHash, blockTimestamp, this.chain, signer);

                        if(rmrkObj.args.hasOwnProperty('_remark')){
                            // const buildRemark = await this.rmrkToObject(rmrkObj.args._remark, tx, i);
                            blockRmrk.push(this.getObjectFromRemark(rmrkObj.args._remark, tx, i));
                        }
                        i += 1;

                    }

                }

            }

            return Promise.all(blockRmrk)
                .then(result=>{
                    this.getMetadataContent(result).then(rmrkWithMeta=>{
                        resolve (rmrkWithMeta);
                    });
                })
                .catch(e=>{
                    // console.log(e);
                })

        })


    }


    private async callMeta(remark: Interaction, index?: number): Promise<Interaction>
    {

        let entity: Entity|null;

        if(remark instanceof Mint){

            if(remark.collection){
                entity = remark.collection;
            }

        }else if(remark instanceof MintNft){

            if(remark.asset){
                entity = remark.asset;
            }
        }

        return new Promise((resolve)=>{

            if(entity){
                MetaData.getMetaData(entity.url, index).then(meta=>{
                    entity?.addMetadata(meta);
                    resolve(remark);
                }).catch((e)=>{
                    // console.error(e);
                    resolve(remark);
                })
            }


        })

    }


    // private async callMeta(entity: Entity, index?: number): Promise<MetaData|null>
    // {
    //
    //     return MetaData.getMetaData(entity.url, index)
    //         .then(meta => {
    //             return meta;
    //         })
    //         .catch(e => {
    //             console.log(e);
    //             return null;
    //         });
    //
    // }



    private async getMetadataContent(interactions: Array<Interaction|string>): Promise<Array<Interaction>>
    {

        return new Promise(async (resolve)=>{

            let rmrkWithMeta: Array<Promise<Interaction>|Interaction> = [];
            let i: number = 0;

            for(const rmrk of interactions){

                if(rmrk instanceof Mint || rmrk instanceof  MintNft){
                    rmrkWithMeta.push(this.callMeta(rmrk, i));
                }else if (rmrk instanceof Interaction){
                    rmrkWithMeta.push(rmrk);
                }
                i++;
            }

            return Promise.all(rmrkWithMeta)
                .then((remarks)=>{
                    resolve (remarks);
                }).catch(e=>{
                    // console.error(e);
                })

        })

    }




    public getObjectFromRemark(remark: string, transaction: Transaction, batchIndex?: number): Promise<Interaction|string>
    {

        return new Promise((resolve)=>{

            const uri = hexToString(remark);
            const url = decodeURIComponent(uri);

            const reader = new RmrkReader(this.chain, transaction);
            const rmrk = reader.readInteraction(url);

            if(rmrk instanceof Interaction){
                resolve (rmrk);
            }else{
                resolve ('no rmrk');
            }

        })

    }



    private static getTimestamp(ex:any): string  {

        let argString = ex.args.toString();
        let secondTimestamp = Number(argString)/1000

        return secondTimestamp.toString();
    }


}