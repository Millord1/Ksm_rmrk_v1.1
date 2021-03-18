
import {Send} from "../Remark/Interactions/Send";
import {MintNft} from "../Remark/Interactions/MintNft";
import {Buy} from "../Remark/Interactions/Buy";
import {Jetski} from "../Jetski/Jetski";
import {CSCanonizeManager} from "canonizer/src/canonizer/CSCanonizeManager";
import {KusamaBlockchain} from "canonizer/src/canonizer/Kusama/KusamaBlockchain";
import {BlockchainAddress} from "canonizer/src/canonizer/BlockchainAddress";
import {BlockchainContract} from "canonizer/src/canonizer/BlockchainContract";
import {RmrkContractStandard} from "canonizer/src/canonizer/Interfaces/RmrkContractStandard";
import {BlockchainEvent} from "canonizer/src/canonizer/BlockchainEvent";

export class EventGossiper
{

    private readonly collectionId: string;
    private readonly sn: string;
    private readonly signer: string;
    private readonly receiver: string;
    private readonly blockId: number;
    private readonly timestamp: string;
    private readonly txId: string;


    constructor(remark: Send|MintNft|Buy) {
        this.collectionId = remark.asset ? remark.asset.assetId : "";
        this.sn = remark.asset ? remark.asset.token.sn : "";
        this.signer = remark.transaction.source;
        this.receiver = remark.transaction.destination ? remark.transaction.destination : "";
        this.blockId = remark.transaction.blockId;
        this.timestamp = remark.transaction.timestamp;
        this.txId = remark.transaction.txHash;
    }

    public async gossip()
    {
        const jwt = Jetski.getJwt();

        const canonizeManager = new CSCanonizeManager({connector:{gossipUrl:'http://arkam.everdreamsoft.com/alex/gossip',jwt:jwt}});
        const sandra =  canonizeManager.getSandra();
        const blockchain = new KusamaBlockchain(sandra);

        const receiver = new BlockchainAddress(blockchain.addressFactory, this.receiver, sandra);
        const address = new BlockchainAddress(blockchain.addressFactory, this.signer, sandra);

        const contract = new BlockchainContract(blockchain.contractFactory, this.collectionId, sandra,new RmrkContractStandard(canonizeManager));
        const contractStandard = new RmrkContractStandard(canonizeManager, this.sn);

        let event = new BlockchainEvent(blockchain.eventFactory, address, receiver, contract, this.txId, this.timestamp, '1', blockchain, this.blockId, contractStandard, sandra);
        canonizeManager.gossipBlockchainEvents(blockchain).then(()=>{console.log("event gossiped " + this.blockId)});
    }

}