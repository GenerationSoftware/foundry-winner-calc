import { getAllParams, writeAllParamFiles, decodeWinners } from './utils/out/index.js'
import { exec } from 'child_process'
import { join } from 'path'
import fs from 'fs'

const inputFile = process.argv[2]
const outputFile = process.argv[3]
const rpcUrl = process.env.FWC_RPC_URL
const rootDir = process.argv[1].substring(0, process.argv[1].length - 8) // 8 chars in 'index.js'

const run = async () => {
  const { chainId, prizePoolAddress, vaultAddress, userAddresses } = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
  
  const allParams = await getAllParams(prizePoolAddress, vaultAddress, userAddresses, rpcUrl, chainId)
  const paramFiles = writeAllParamFiles(allParams, rootDir)
  
  const scriptPath = join(rootDir, './sol/script/WinnerCalc.s.sol')
  const configPath = join(rootDir, './sol/foundry.toml')
  const cachePath = join(rootDir, './sol/cache')

  const winnerMap = new Map()
  
  for(const [tier, paramFilePath] of paramFiles) {
    await new Promise((resolve, reject) => {
      const execOutFile = `${paramFilePath.substring(0, paramFilePath.length - 10)}results.txt` // removes the last 10 chars of param filename (params.txt)
      exec(`export FWC_PARAM_FILENAME="${paramFilePath}" && export FWC_OUTPUT_FILENAME="${execOutFile}" && forge script ${scriptPath}:WinnerCalcScript --config-path ${configPath} --cache-path ${cachePath}`, (error, stdout, stderr) => {
        if(error ?? stderr) {
          reject(error ?? stderr)
        } else {
          const winners = decodeWinners(fs.readFileSync(execOutFile, 'utf8'))
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

  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2))
}

run()