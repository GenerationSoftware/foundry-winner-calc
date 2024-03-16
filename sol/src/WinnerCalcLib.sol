// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { PrizePool, TierCalculationLib, SD59x18 } from "pt-v5-prize-pool/PrizePool.sol";

struct Params {
    PrizePool prizePool;
    address vault;
    uint8 tier;
    SD59x18 tierOdds;
    SD59x18 vaultPortion;
    uint256 vaultTotalSupplyTwab;
    address[] user;
    uint256[] userTwab;
}

struct Winner {
    address user;
    uint32 prizeIndices;
}

library WinnerCalcLib {
    
    function isWinner(Params memory params, uint256 userIndex, uint256 winningRandomNumber, uint24 lastAwardedDrawId, uint32 prizeIndex) internal pure returns (bool) {
        uint256 _userSpecificRandomNumber = TierCalculationLib.calculatePseudoRandomNumber(
            lastAwardedDrawId,
            params.vault,
            params.user[userIndex],
            params.tier,
            prizeIndex,
            winningRandomNumber
        );
        return TierCalculationLib.isWinner(
            _userSpecificRandomNumber,
            params.userTwab[userIndex],
            params.vaultTotalSupplyTwab,
            params.vaultPortion,
            params.tierOdds
        );
    }

    /// @dev pushes winners to the `winners` array based off the prize param info
    function getWinningPicks(Params memory params, Winner[] storage winners) internal view {
        
    }

}