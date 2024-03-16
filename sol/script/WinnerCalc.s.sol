// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { Params, PrizePool, WinnerCalcLib, Winner } from "../src/WinnerCalcLib.sol";

contract WinnerCalcScript is Script {

    Winner[] public winners;

    function run() public {
        string memory paramFilename = vm.envString("FWC_PARAM_FILENAME");
        string memory outputFilename = vm.envString("FWC_OUTPUT_FILENAME");
        Params memory params = abi.decode(vm.readFileBinary(paramFilename), (Params));
        WinnerCalcLib.getWinningPicks(params, winners);
        vm.writeFileBinary(outputFilename, abi.encode(winners));
    }

}
