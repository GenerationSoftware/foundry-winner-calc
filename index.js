import { getAllParams, decodeWinners } from './utils/out/index.js'
import { exec } from 'child_process'
import { join, dirname } from 'path'
import fs from 'fs'

const inputFile = process.argv[2]
const outputFile = process.argv[3]
const rpcUrl = process.env.FWC_RPC_URL
const rootDir = process.argv[1].substring(0, process.argv[1].length - 8) // 8 chars in 'index.js'

const run = async () => {
  const { chainId, prizePoolAddress, vaultAddress, userAddresses } = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
  
  const allParams = Object.entries(await getAllParams(prizePoolAddress, vaultAddress, userAddresses, rpcUrl, chainId))
  
  const scriptPath = join(rootDir, './sol/script/WinnerCalc.s.sol')
  const configPath = join(rootDir, './sol/foundry.toml')
  const cachePath = join(rootDir, './sol/cache')
  const paramsPath = join(rootDir, './sol/files/params.txt')
  const resultsPath = join(rootDir, './sol/files/results.txt')

  const winnerMap = new Map()
  
  for(const [tier, params] of allParams) {
    try { fs.mkdirSync(dirname(paramsPath)) } catch {}
    fs.writeFileSync(paramsPath, params)
    await new Promise((resolve, reject) => {
      exec(`forge script ${scriptPath}:WinnerCalcScript --config-path ${configPath} --cache-path ${cachePath}`, (error, stdout, stderr) => {
        if(error ?? stderr) {
          reject(error ?? stderr)
        } else {
          const winners = decodeWinners(fs.readFileSync(resultsPath, 'utf8'))
          for(const winner of winners) {
            if(!winnerMap.has(winner.user)) {
              winnerMap.set(winner.user, {
                user: winner.user,
                prizes: {}
              })
            }
            const userData = winnerMap.get(winner.user)
            if (!userData.prizes[tier]) {
              userData.prizes[tier] = []
            }
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