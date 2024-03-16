// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Test.sol";

interface IPrizePool {
    function isWinner(address _vault, address _user, uint8 _tier, uint32 _prizeIndex) external view returns (bool);
}

contract IsWinnerTest is Test {
    IPrizePool public prizePool;

    function setUp() public {
        prizePool = IPrizePool(address(0xe32e5E1c5f0c80bD26Def2d0EA5008C107000d6A));
    }

    function test() external {
        assertEq(
            prizePool.isWinner(
                address(0x77935F2c72b5eB814753a05921aE495aa283906B),
                address(0x56a07d0745785682950742ab55247330c80b5a5d),
                2,
                6
            ),
            true
        );
        assertEq(
            prizePool.isWinner(
                address(0xCe8293f586091d48A0cE761bBf85D5bCAa1B8d2b),
                address(0xBB7724d5Fc4Af70489B66D13b4f19361b1e31457),
                3,
                3
            ),
            true
        );
        assertEq(
            prizePool.isWinner(
                address(0xCe8293f586091d48A0cE761bBf85D5bCAa1B8d2b),
                address(0xBB7724d5Fc4Af70489B66D13b4f19361b1e31457),
                3,
                11
            ),
            true
        );
        assertEq(
            prizePool.isWinner(
                address(0xCe8293f586091d48A0cE761bBf85D5bCAa1B8d2b),
                address(0x65544898B40e9Ad57E15721Ea3003B5e40547cE8),
                3,
                15
            ),
            true
        );
        assertEq(
            prizePool.isWinner(
                address(0xf0B19f02c63d51B69563A2b675e0160e1C34397C),
                address(0x12Dc4dA5037152F97aDC89a54C855e9bc84eEB7d),
                3,
                45
            ),
            true
        );
        assertEq(
            prizePool.isWinner(
                address(0xf0B19f02c63d51B69563A2b675e0160e1C34397C),
                address(0xe48dD2A322a7EBFDAa9680fD2E8cEC27CBB7A765),
                3,
                33
            ),
            true
        );
        assertEq(
            prizePool.isWinner(
                address(0xf0B19f02c63d51B69563A2b675e0160e1C34397C),
                address(0x223310371E98755A35756Ea24B629113584a8d9d),
                3,
                55
            ),
            true
        );

        assertEq(
            prizePool.isWinner(
                address(0xf0B19f02c63d51B69563A2b675e0160e1C34397C),
                address(0x223310371E98755A35756Ea24B629113584a8d9d),
                3,
                56
            ),
            false
        );
        assertEq(
            prizePool.isWinner(
                address(0xf0B19f02c63d51B69563A2b675e0160e1C34397C),
                address(0x223310371E98755A35756Ea24B629113584a8d9d),
                3,
                57
            ),
            false
        );
        assertEq(
            prizePool.isWinner(
                address(0xf0B19f02c63d51B69563A2b675e0160e1C34397C),
                address(0xBB7724d5Fc4Af70489B66D13b4f19361b1e31457),
                3,
                33
            ),
            false
        );
        assertEq(
            prizePool.isWinner(
                address(0xf0B19f02c63d51B69563A2b675e0160e1C34397C),
                address(0xBB7724d5Fc4Af70489B66D13b4f19361b1e31457),
                3,
                34
            ),
            false
        );
        assertEq(
            prizePool.isWinner(
                address(0xf0B19f02c63d51B69563A2b675e0160e1C34397C),
                address(0x1CC346065dE103bd134eCb0D77E383398579a299),
                3,
                34
            ),
            false
        );
    }
}
