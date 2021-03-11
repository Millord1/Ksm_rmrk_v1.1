import {Blockchain} from "../Blockchains/Blockchain";
import {Interaction} from "../Remark/Interactions/Interaction";
import {Mint} from "../Remark/Interactions/Mint";
import {Transaction} from "../Remark/Transaction";
import {MintNft} from "../Remark/Interactions/MintNft";
import {Send} from "../Remark/Interactions/Send";


export class RmrkReader
{

    private chain: Blockchain;
    private transaction: Transaction;

    constructor(chain: Blockchain, transaction: Transaction) {
        this.chain = chain;
        this.transaction = transaction;
    }

    public readInteraction(rmrk: string): Interaction|null
    {

        if(rmrk.includes('::')){

            const rmrkArray = rmrk.split('::');

            if(rmrkArray.length >= 2){

                let interaction: string = rmrkArray[1].toLowerCase();

                switch(interaction){

                    case 'mint':
                        return new Mint(rmrk, this.chain, this.transaction);

                    case 'mintnft':
                        return new MintNft(rmrk, this.chain, this.transaction);

                    case 'send':
                        return new Send(rmrk, this.chain, this.transaction);

                    default:
                        return null;

                }
            }
        }
        return null;
    }

}