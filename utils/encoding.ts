import { encodeAbiParameters, decodeAbiParameters, type Address } from "viem"
import { paramsABI } from "./abis/params.js"
import { winnersABI } from "./abis/winners.js"

export const encodeParams = (data: {
  winningRandomNumber: bigint
  lastAwardedDrawId: number
  vaultAddress: Address
  tier: number
  tierPrizeCount: number
  tierOdds: bigint
  vaultPortion: bigint
  vaultTwab: bigint
  userAddresses: Address[]
  userTwabs: bigint[]
}) => {
  return encodeAbiParameters(
    paramsABI[0].inputs,
    [
      { 
        winningRandomNumber: data.winningRandomNumber,
        lastAwardedDrawId: data.lastAwardedDrawId,
        vault: data.vaultAddress,
        tier: data.tier,
        tierPrizeCount: data.tierPrizeCount,
        tierOdds: data.tierOdds,
        vaultPortion: data.vaultPortion,
        vaultTotalSupplyTwab: data.vaultTwab,
        user: data.userAddresses,
        userTwab: data.userTwabs
      }
    ]
  )
}

export const decodeWinners = (encodedData: `0x${string}`) => {
  return decodeAbiParameters(winnersABI[0].inputs, encodedData)[0]
}