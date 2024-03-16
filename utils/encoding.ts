import { encodeAbiParameters, type Address } from "viem"
import { paramsABI } from "./abis/params"

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
