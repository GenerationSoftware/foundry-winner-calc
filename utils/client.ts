import { Chain, createPublicClient, http, type HttpTransport, type PublicClient } from "viem"
import {
  mainnet,
  optimism,
  arbitrum,
  sepolia,
  optimismSepolia,
  arbitrumSepolia,
  base,
  baseSepolia
} from 'viem/chains'

const chains: Record<number, Chain> = {
  1: mainnet,
  10: optimism,
  8453: base,
  42161: arbitrum,
  11155111: sepolia,
  11155420: optimismSepolia,
  84532: baseSepolia,
  421614: arbitrumSepolia
}

export const getClient = (rpcUrl: string, chainId: number) => {
  return createPublicClient({ transport: http(rpcUrl), chain: chains[chainId] }) as PublicClient<HttpTransport>
}
