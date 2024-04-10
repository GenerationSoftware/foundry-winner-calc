import { prizePoolABI } from "./abis/prizePool.js"
import type { Address, ContractFunctionParameters, PublicClient } from "viem"

export const getPrizePoolInfo = async (client: PublicClient, prizePoolAddress: Address, options?: { blockNumber?: bigint }) => {
  const multicallResults = await client.multicall({
    contracts: [
      { address: prizePoolAddress, abi: prizePoolABI, functionName: 'twabController' },
      { address: prizePoolAddress, abi: prizePoolABI, functionName: 'getWinningRandomNumber' },
      { address: prizePoolAddress, abi: prizePoolABI, functionName: 'getLastAwardedDrawId' },
      { address: prizePoolAddress, abi: prizePoolABI, functionName: 'numberOfTiers' }
    ],
    blockNumber: options?.blockNumber
  })

  if(multicallResults.some(i => i.status === 'failure')) {
    throw new Error('Could not query basic prize pool information.')
  }

  const twabControllerAddress = multicallResults[0].result as Address
  const randomNumber = multicallResults[1].result as bigint
  const lastAwardedDrawId = multicallResults[2].result as number
  const numTiers = multicallResults[3].result as number

  const lastAwardedDrawClosedAt = await client.readContract({
    address: prizePoolAddress,
    abi: prizePoolABI,
    functionName: 'drawClosesAt',
    args: [lastAwardedDrawId]
  })

  return { twabControllerAddress, randomNumber, lastAwardedDrawId, lastAwardedDrawClosedAt, numTiers }
}

export const getTierInfo = async (client: PublicClient, prizePoolAddress: Address, numTiers: number, lastAwardedDrawId: number, options?: { blockNumber?: bigint }) => {
  const tierInfo: { [tier: number]: { prizeCount: number, odds: bigint, accrualDraws: number, startTwabDrawId: number, startTwabTimestamp: number } } = {}
  const tiers = Array.from(Array(numTiers).keys())
  const startDrawIds: { [tier: number]: number } = {}

  const firstContracts: ContractFunctionParameters[] = []
  tiers.forEach(tier => {
    firstContracts.push({ address: prizePoolAddress, abi: prizePoolABI, functionName: 'getTierPrizeCount', args: [tier] })
    firstContracts.push({ address: prizePoolAddress, abi: prizePoolABI, functionName: 'getTierOdds', args: [tier, numTiers] }),
    firstContracts.push({ address: prizePoolAddress, abi: prizePoolABI, functionName: 'getTierAccrualDurationInDraws', args: [tier] })
  })

  const firstMulticallResults = await client.multicall({ contracts: firstContracts, blockNumber: options?.blockNumber })

  if(firstMulticallResults.some(i => i.status === 'failure')) {
    throw new Error('Could not query basic tier information.')
  }

  const secondContracts: ContractFunctionParameters[] = []
  tiers.forEach(tier => {
    const accrualDraws = firstMulticallResults[tier * 3 + 2].result as number
    startDrawIds[tier] = (lastAwardedDrawId - accrualDraws + 1) > 0 ? lastAwardedDrawId - accrualDraws + 1 : 1
    secondContracts.push({ address: prizePoolAddress, abi: prizePoolABI, functionName: 'drawOpensAt', args: [startDrawIds[tier]] })
  })

  const secondMulticallResults = await client.multicall({ contracts: secondContracts, blockNumber: options?.blockNumber })

  if(secondMulticallResults.some(i => i.status === 'failure')) {
    throw new Error('Could not query draw timestamps based on tier accrual duration.')
  }

  tiers.forEach(tier => {
    tierInfo[tier] = {
      prizeCount: firstMulticallResults[tier * 3].result as number,
      odds: firstMulticallResults[tier * 3 + 1].result as bigint,
      accrualDraws: firstMulticallResults[tier * 3 + 2].result as number,
      startTwabDrawId: startDrawIds[tier],
      startTwabTimestamp: secondMulticallResults[tier].result as number
    }
  })

  return tierInfo
}

export const getVaultPortion = async (client: PublicClient, prizePoolAddress: Address, vaultAddress: Address, drawIds: { start: number, end: number }) => {
  const vaultPortion = await client.readContract({
    address: prizePoolAddress,
    abi: prizePoolABI,
    functionName: 'getVaultPortion',
    args: [vaultAddress, drawIds.start, drawIds.end]
  })

  return vaultPortion
}
