import { getClient } from "./client.js"
import { encodeParams } from "./encoding.js"
import { getPrizePoolInfo, getTierInfo, getVaultPortion } from "./prizePool.js"
import { getTwabs } from "./twab.js"
import type { Address } from "viem"

export const getAllParams = async (chainId: number, rpcUrl: string, prizePoolAddress: Address, vaultAddress: Address, userAddresses: Address[], options?: { multicallBatchSize?: number }) => {
  const params: { [tier: number]: `0x${string}` } = {}
  const cachedTwabs: { [startTimestamp: number]: ReturnType<typeof getTwabs> } = {}

  const client = getClient(chainId, rpcUrl, options)

  const prizePoolInfo = await getPrizePoolInfo(client, prizePoolAddress)
  const tierInfo = await getTierInfo(client, prizePoolAddress, prizePoolInfo.numTiers, prizePoolInfo.lastAwardedDrawId)

  await Promise.all(Object.keys(tierInfo).map(async (_tier) => {
    const tier = parseInt(_tier)
    const vaultPortion = await getVaultPortion(client, prizePoolAddress, vaultAddress, { start: tierInfo[tier].startTwabDrawId, end: prizePoolInfo.lastAwardedDrawId })

    const startTwabTimestamp = tierInfo[tier].startTwabTimestamp
    if(cachedTwabs[startTwabTimestamp] === undefined) {
      cachedTwabs[startTwabTimestamp] = getTwabs(client, prizePoolInfo.twabControllerAddress, vaultAddress, userAddresses, { start: startTwabTimestamp, end: prizePoolInfo.lastAwardedDrawClosedAt })
    }
    const { vaultTwab, userTwabs } = await cachedTwabs[startTwabTimestamp]

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
