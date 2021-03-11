import {BlockchainContract} from "./BlockchainContract";


export class Token
{

    public sn: string;
    public contractId: string;
    public transferable?: boolean;
    public contract?: BlockchainContract;

    constructor(sn: string, contract: BlockchainContract|string, transferable?: boolean) {
        this.sn = sn;
        this.transferable = transferable;

        if(contract instanceof BlockchainContract){
            this.contract = contract;
            this.contractId = this.contract.id;
        }else{
            this.contractId = contract;
        }
    }


}