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
} from "viem/chains"

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

export const getClient = (chainId: number, rpcUrl: string, clientOptions?: { multicallBatchSize?: number }) => {
  const client = createPublicClient({ chain: chains[chainId], transport: http(rpcUrl) }) as PublicClient<HttpTransport>
  if (!!clientOptions?.multicallBatchSize) {
    client.batch = {
      multicall: {
        batchSize: clientOptions?.multicallBatchSize
      }
    }
  } 
  return client
}
