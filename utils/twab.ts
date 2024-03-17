import { twabControllerABI } from "./abis/twabController.js"
import type { Address, PublicClient } from "viem"

export const getTwabs = async (client: PublicClient, twabControllerAddress: Address, vaultAddress: Address, userAddresses: Address[], timestamps: { start: number, end: number }) => {
  const userTwabs: { address: Address, twab: bigint }[] = []

  const multicallResults = await client.multicall({
    contracts: [
      {
        address: twabControllerAddress,
        abi: twabControllerABI,
        functionName: 'getTotalSupplyTwabBetween',
        args: [vaultAddress, BigInt(timestamps.start), BigInt(timestamps.end)]
      },
      ...userAddresses.map(userAddress => ({
        address: twabControllerAddress,
        abi: twabControllerABI,
        functionName: 'getTwabBetween',
        args: [vaultAddress, userAddress, BigInt(timestamps.start), BigInt(timestamps.end)]
      }))
    ]
  })

  if(multicallResults[0].status === 'failure') {
    throw new Error(`Could not query vault twab for ${vaultAddress}.`)
  }

  const vaultTwab = multicallResults[0].result as bigint

  multicallResults.slice(1).forEach((result, i) => {
    if(result.status === 'success') {
      userTwabs.push({ address: userAddresses[i], twab: result.result as bigint })
    }
  })

  return { vaultTwab, userTwabs }
}
