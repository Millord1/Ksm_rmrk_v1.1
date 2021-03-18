import {scan, startScanner, test} from "./Jetski/StartScan";


const {program} = require('commander');

program.command("fetch")
    .option("--chain <chain>", "chain name")
    .option("--block <block>", "block number")
    // .option("--meta <meta>", "with meta content", true)
    .action(startScanner);


program.command("scan")
    .option("--block <block>")
    .action(scan)


program.command("hello").action(test);

program.parse(process.argv);


