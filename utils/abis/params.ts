export const paramsABI = [
  {
    name: 'staticStruct',
    inputs: [
      {
        components: [
          { name: 'winningRandomNumber', type: 'uint256' },
          { name: 'lastAwardedDrawId', type: 'uint24' },
          { name: 'vault', type: 'address' },
          { name: 'tier', type: 'uint8' },
          { name: 'tierPrizeCount', type: 'uint32' },
          { name: 'tierOdds', type: 'uint256' },
          { name: 'vaultPortion', type: 'uint256' },
          { name: 'vaultTotalSupplyTwab', type: 'uint256' },
          { name: 'user', type: 'address[]' },
          { name: 'userTwab', type: 'uint256[]' },
        ],
        name: 'Params',
        type: 'tuple'
      }
    ]
  }
] as const
