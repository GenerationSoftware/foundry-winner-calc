import { twabControllerABI } from "./abis/twabController.js"
import type { Address, PublicClient } from "viem"

export const getVaultTwab = async (client: PublicClient, twabControllerAddress: Address, vaultAddress: Address, timestamps: { start: number, end: number }) => {
  const vaultTwab = await client.readContract({
    address: twabControllerAddress,
    abi: twabControllerABI,
    functionName: 'getTotalSupplyTwabBetween',
    args: [vaultAddress, BigInt(timestamps.start), BigInt(timestamps.end)]
  })

  return vaultTwab
}

export const getUserTwabs = async (client: PublicClient, twabControllerAddress: Address, vaultAddress: Address, userAddresses: Address[], timestamps: { start: number, end: number }) => {
  const userTwabs: { address: Address, twab: bigint }[] = []

  const multicallResults = await client.multicall({
    contracts: userAddresses.map(userAddress => ({
      address: twabControllerAddress,
      abi: twabControllerABI,
      functionName: 'getTwabBetween',
      args: [vaultAddress, userAddress, BigInt(timestamps.start), BigInt(timestamps.end)]
    }))
  })

  multicallResults.forEach((result, i) => {
    if(result.status === 'success') {
      userTwabs.push({ address: userAddresses[i], twab: result.result as bigint })
    }
  })

  return userTwabs
}
