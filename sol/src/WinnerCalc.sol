// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Vm } from "forge-std/Vm.sol";
import { TierCalculationLib, SD59x18 } from "pt-v5-prize-pool/PrizePool.sol";

struct Params {
    uint256 winningRandomNumber;
    uint24 lastAwardedDrawId;
    address vault;
    uint8 tier;
    uint32 tierPrizeCount;
    SD59x18 tierOdds;
    SD59x18 vaultPortion;
    uint256 vaultTotalSupplyTwab;
    address[] user;
    uint256[] userTwab;
}

struct Winner {
    address user;
    uint32 prizeIndex;
}

contract WinnerCalc {

    Winner[] private winners;
    
    /// @dev pushes winners to the `winners` array based off the prize param info
    function checkWin(
        uint256 winningRandomNumber,
        uint24 lastAwardedDrawId,
        address vault,
        uint256 vaultTotalSupplyTwab,
        SD59x18 vaultPortion,
        address user,
        uint256 userTwab,
        uint8 tier,
        SD59x18 tierOdds,
        uint32 prizeIndex
    ) external {
        uint256 _userSpecificRandomNumber = TierCalculationLib.calculatePseudoRandomNumber(
            lastAwardedDrawId,
            vault,
            user,
            tier,
            prizeIndex,
            winningRandomNumber
        );
        if (
            TierCalculationLib.isWinner(
                _userSpecificRandomNumber,
                userTwab,
                vaultTotalSupplyTwab,
                vaultPortion,
                tierOdds
            )
        ) {
            winners.push(Winner({
                user: user,
                prizeIndex: prizeIndex
            }));
        }
    }

    function writeResults(Vm vm, string memory outputFilename) external {
        vm.writeFile(outputFilename, vm.toString(abi.encode(winners)));
    }

}