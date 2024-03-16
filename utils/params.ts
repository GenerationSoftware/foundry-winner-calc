import { getClient } from "./client"
import { encodeParams } from "./encoding"
import { getPrizePoolInfo, getTierInfo, getVaultPortion } from "./prizePool"
import { getUserTwabs, getVaultTwab } from "./twab"
import type { Address } from "viem"

export const getAllParams = async (prizePoolAddress: Address, vaultAddress: Address, userAddresses: Address[], rpcUrl: string) => {
  const params: { [tier: number]: `0x${string}` } = {}

  const { client } = await getClient(rpcUrl)

  const prizePoolInfo = await getPrizePoolInfo(client, prizePoolAddress)
  const tierInfo = await getTierInfo(client, prizePoolAddress, prizePoolInfo.numTiers, prizePoolInfo.lastAwardedDrawId)

  await Promise.all(Object.keys(tierInfo).map(async (_tier) => {
    const tier = parseInt(_tier)
    const vaultPortion = await getVaultPortion(client, prizePoolAddress, vaultAddress, { start: tierInfo[tier].startTwabDrawId, end: prizePoolInfo.lastAwardedDrawId })
    const vaultTwab = await getVaultTwab(client, prizePoolInfo.twabControllerAddress, vaultAddress, { start: tierInfo[tier].startTwabTimestamp, end: prizePoolInfo.lastAwardedDrawClosedAt })
    const userTwabs = await getUserTwabs(client, prizePoolInfo.twabControllerAddress, vaultAddress, userAddresses, { start: tierInfo[tier].startTwabTimestamp, end: prizePoolInfo.lastAwardedDrawClosedAt })

    const encodedParams = encodeParams({
      winningRandomNumber: prizePoolInfo.randomNumber,
      lastAwardedDrawId: prizePoolInfo.lastAwardedDrawId,
      vaultAddress,
      tier,
      tierPrizeCount: tierInfo[tier].prizeCount,
      tierOdds: tierInfo[tier].odds,
      vaultPortion,
      vaultTwab,
      userAddresses: userTwabs.map(user => user.address),
      userTwabs: userTwabs.map(user => user.twab)
    })

    params[tier] = encodedParams
  }))

  return params
}
