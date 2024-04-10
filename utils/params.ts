import { getClient } from "./client.js"
import { encodeParams } from "./encoding.js"
import { getPrizePoolInfo, getTierInfo, getVaultPortion } from "./prizePool.js"
import { getTwabs } from "./twab.js"
import type { Address } from "viem"

export const getAllParams = async (chainId: number, rpcUrl: string, prizePoolAddress: Address, vaultAddress: Address, userAddresses: Address[], options?: { multicallBatchSize?: number, blockNumber?: bigint }) => {
  const params: { tier: number, params: `0x${string}`, chunkSize: number, prizeCount: number }[] = []
  const cachedTwabs: { [startTimestamp: number]: ReturnType<typeof getTwabs> } = {}

  const client = getClient(chainId, rpcUrl, options)

  const prizePoolInfo = await getPrizePoolInfo(client, prizePoolAddress, options)
  const tierInfo = await getTierInfo(client, prizePoolAddress, prizePoolInfo.numTiers, prizePoolInfo.lastAwardedDrawId, options)

  await Promise.all(Object.keys(tierInfo).map(async (_tier) => {
    const tier = parseInt(_tier)
    const vaultPortion = await getVaultPortion(client, prizePoolAddress, vaultAddress, { start: tierInfo[tier].startTwabDrawId, end: prizePoolInfo.lastAwardedDrawId })

    const startTwabTimestamp = tierInfo[tier].startTwabTimestamp
    if(cachedTwabs[startTwabTimestamp] === undefined) {
      cachedTwabs[startTwabTimestamp] = getTwabs(
        client,
        prizePoolInfo.twabControllerAddress,
        vaultAddress,
        userAddresses,
        { start: startTwabTimestamp, end: prizePoolInfo.lastAwardedDrawClosedAt },
        options
      )
    }
    const { vaultTwab, userTwabs } = await cachedTwabs[startTwabTimestamp]

    const chunkSize = Math.min(10_000, Math.ceil(1_000_000 / tierInfo[tier].prizeCount)) // varies between 1-1000 based on prize count
    const userChunks: (typeof userTwabs)[] = []
    for (let chunk = 0; userChunks.length < Math.ceil(userTwabs.length / chunkSize); chunk++) {
      userChunks.push(
        userTwabs.slice(
          chunk * chunkSize,
          Math.min((chunk + 1) * chunkSize, userTwabs.length)
        )
      )
    }

    for (const userChunk of userChunks) {
      const encodedParams = encodeParams({
        winningRandomNumber: prizePoolInfo.randomNumber,
        lastAwardedDrawId: prizePoolInfo.lastAwardedDrawId,
        vaultAddress,
        tier,
        tierPrizeCount: tierInfo[tier].prizeCount,
        tierOdds: tierInfo[tier].odds,
        vaultPortion,
        vaultTwab,
        userAddresses: userChunk.map(user => user.address),
        userTwabs: userChunk.map(user => user.twab)
      })
      params.push({ tier, params: encodedParams, chunkSize: userChunk.length, prizeCount: tierInfo[tier].prizeCount })
    }
  }))

  return params
}
