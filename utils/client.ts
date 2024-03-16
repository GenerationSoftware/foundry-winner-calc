import { createPublicClient, http, type HttpTransport, type PublicClient } from "viem"

export const getClient = async (rpcUrl: string) => {
  const client = createPublicClient({ transport: http(rpcUrl)}) as PublicClient<HttpTransport>

  const chainId = await client.getChainId()

  return { chainId, client }
}
