import { getAllParams, decodeWinners } from './utils/out/index.js'
import { exec } from 'child_process'
import { join, dirname } from 'path'
import fs from 'fs'
import 'dotenv/config'

const rootDir = dirname(process.argv[1])
const inputFile = process.argv[2]
const outputFile = process.argv[3]
const rpcUrl = process.env.FWC_RPC_URL

const run = async () => {
  const { chainId, multicallBatchSize, prizePoolAddress, vaultAddress, userAddresses, debug, blockNumber } = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
  const parsedBlockNumber = !!blockNumber ? BigInt(blockNumber) : undefined;
  
  const paramBatches = await getAllParams(chainId, rpcUrl, prizePoolAddress, vaultAddress, userAddresses, { multicallBatchSize, blockNumber: parsedBlockNumber })
  
  const scriptPath = join(rootDir, './sol/script/WinnerCalc.s.sol')
  const configPath = join(rootDir, './sol/foundry.toml')
  const cachePath = join(rootDir, './sol/cache')
  const paramsPath = join(rootDir, './sol/files/params.txt')
  const resultsPath = join(rootDir, './sol/files/results.txt')

  const winnerMap = new Map()
  
  for(const { tier, params, chunkSize, prizeCount } of paramBatches) {
    console.log(`Calculating prizes for tier ${tier}, checking ${chunkSize} addresses (${chunkSize * prizeCount} total picks)...`)

    try { fs.mkdirSync(dirname(paramsPath)) } catch {}
    fs.writeFileSync(paramsPath, params)

    await new Promise((resolve, reject) => {
      exec(`forge script ${scriptPath}:WinnerCalcScript --config-path ${configPath} --cache-path ${cachePath} --memory-limit 268435456 --skip-simulation`, (error, stdout, stderr) => {
        if(error ?? stderr) {
          if (debug) {
            console.log(stdout)
          }
          console.log(stderr)
          reject(error ?? stderr)
        } else {
          const winners = decodeWinners(fs.readFileSync(resultsPath, 'utf8'))
          console.log(`Found ${winners.length} winner${winners.length == 1 ? "" : "s"}${winners.length > 0 ? "!" : "."}`)

          for(const winner of winners) {
            if(!winnerMap.has(winner.user)) {
              winnerMap.set(winner.user, { user: winner.user, prizes: {} })
            }

            const userData = winnerMap.get(winner.user)

            if(!userData.prizes[tier]) { userData.prizes[tier] = [] }
            userData.prizes[tier].push(winner.prizeIndex)
          }
          resolve()
        }
      })
    })
  }

  const results = {
    winners: [...winnerMap.values()]
  }

  try { fs.mkdirSync(dirname(outputFile), { recursive: true }) } catch {} 
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2))
}

run()
