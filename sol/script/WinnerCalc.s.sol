// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import { Params, WinnerCalc, Winner } from "../src/WinnerCalc.sol";

contract WinnerCalcScript is Script {

    WinnerCalc public winnerCalc;

    function run() public {
        string memory paramFilename = "files/params.txt";
        string memory outputFilename = "files/results.txt";
        Params memory params = abi.decode(vm.parseBytes(vm.readFile(paramFilename)), (Params));

        winnerCalc = new WinnerCalc();
        for (uint256 userIndex = 0; userIndex < params.user.length; userIndex++) {
            for (uint32 prizeIndex = 0; prizeIndex < params.tierPrizeCount; prizeIndex++) {
                winnerCalc.checkWin(
                    params.winningRandomNumber,
                    params.lastAwardedDrawId,
                    params.vault,
                    params.vaultTotalSupplyTwab,
                    params.vaultPortion,
                    params.user[userIndex],
                    params.userTwab[userIndex],
                    params.tier,
                    params.tierOdds,
                    prizeIndex
                );
            }
        }
        winnerCalc.writeResults(vm, outputFilename);
    }

}
