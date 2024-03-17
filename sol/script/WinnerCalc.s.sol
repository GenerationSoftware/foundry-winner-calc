// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { Params, WinnerCalcLib, Winner } from "../src/WinnerCalcLib.sol";

contract WinnerCalcScript is Script {

    Winner[] public winners;

    function run() public {
        string memory paramFilename = "files/params.txt";
        string memory outputFilename = "files/results.txt";
        Params memory params = abi.decode(vm.parseBytes(vm.readFile(paramFilename)), (Params));
        WinnerCalcLib.getWinningPicks(params, winners);
        vm.writeFile(outputFilename, vm.toString(abi.encode(winners)));
    }

}
