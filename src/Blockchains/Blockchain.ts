

interface BlockchainInterface
{
    name: string;
    symbol: string;
    prefix: string;
    isSubstrate: boolean;
}

export abstract class Blockchain implements BlockchainInterface
{
    public name: string;
    public symbol: string;
    public prefix: string;
    public isSubstrate: boolean;
    public wsProvider: string;

    public constructor(name: string, symbol: string, prefix: string, isSubstrate: boolean, wsProvider: string)
    {
        this.name = name;
        this.symbol = symbol;
        this.prefix = prefix;
        this.isSubstrate = isSubstrate;
        this.wsProvider = wsProvider;
    }

    
}