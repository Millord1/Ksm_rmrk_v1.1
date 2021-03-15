
export class VersionChecker
{

    private static isGoodVersion: boolean;


    public static checkVersionOneZero(rmrkArray: Array<string>): boolean
    {
        return this.checkVersion(rmrkArray, "1.0.0")
    }


    private static checkVersion(rmrkArray: Array<string>, version: string)
    {

        const isVersion: string = rmrkArray[2];

        this.isGoodVersion = false;

        if(!Number.isNaN(isVersion)){
            this.isGoodVersion = isVersion.includes(version) || isVersion.includes("RMRK"+version);
        }

        return this.isGoodVersion;

    }


}