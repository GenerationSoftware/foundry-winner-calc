import { getAllParams, writeAllParamFiles, decodeWinners } from './utils/out'
import { exec } from 'child_process'
import fs from "fs"

const inputFile = process.argv[2]
const outputFile = process.argv[3]
const rpcUrl = process.env.RPC_URL

const run = async () => {
  const { prizePoolAddress, vaultAddress, userAddresses } = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
  
  const allParams = await getAllParams(prizePoolAddress, vaultAddress, userAddresses, rpcUrl)
  const paramFilePaths = writeAllParamFiles(allParams)
  
  const scriptPath = './sol/script/WinnerCalc.s.sol'
  const configPath = './sol/foundry.toml'
  const cachePath = './sol/cache'
  
  paramFilePaths.forEach(paramFilePath => {
    exec(`export FWC_PARAM_FILENAME="${paramFilePath}" && export FWC_OUTPUT_FILENAME="${outputFile}" && forge script ${scriptPath}:WinnerCalcScript --config-path ${configPath} --cache-path ${cachePath}`, (error, stdout, stderr) => {
      console.log(error, stdout, stderr) // TODO: remove?

      if(error ?? stderr) {
        console.error(error ?? stderr)
      } else {
        const winners = decodeWinners(fs.readFileSync(outputFile, 'utf8'))
        console.log(JSON.stringify(winners, null, 2)) // TODO: write pretty winners output file instead of logging
      }
    })
  })
}

run()