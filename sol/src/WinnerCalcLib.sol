// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

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

library WinnerCalcLib {
    
    function isWinner(
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
    ) internal pure returns (bool) {
        uint256 _userSpecificRandomNumber = TierCalculationLib.calculatePseudoRandomNumber(
            lastAwardedDrawId,
            vault,
            user,
            tier,
            prizeIndex,
            winningRandomNumber
        );
        return TierCalculationLib.isWinner(
            _userSpecificRandomNumber,
            userTwab,
            vaultTotalSupplyTwab,
            vaultPortion,
            tierOdds
        );
    }

    /// @dev pushes winners to the `winners` array based off the prize param info
    function getWinningPicks(Params memory params, Winner[] storage winners) internal {
        for (uint256 userIndex = 0; userIndex < params.user.length; userIndex++) {
            for (uint32 prizeIndex = 0; prizeIndex < params.tierPrizeCount; prizeIndex++) {
                if (isWinner(
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
                )) {
                    winners.push(Winner({
                        user: params.user[userIndex],
                        prizeIndex: prizeIndex
                    }));
                }
            }
        }
    }

}