import { getClient } from "./client.js"
import { encodeParams } from "./encoding.js"
import { getPrizePoolInfo, getTierInfo, getVaultPortion } from "./prizePool.js"
import { getUserTwabs, getVaultTwab } from "./twab.js"
import type { Address } from "viem"

export const getAllParams = async (prizePoolAddress: Address, vaultAddress: Address, userAddresses: Address[], rpcUrl: string, chainId: number) => {
  const params: { [tier: number]: `0x${string}` } = {}

  const client = getClient(rpcUrl, chainId)

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
