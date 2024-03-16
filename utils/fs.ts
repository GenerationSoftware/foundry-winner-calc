import { getAllParams } from "./params"
import fs from "fs"

export const writeAllParamFiles = (allParams: Awaited<ReturnType<typeof getAllParams>>) => {
  const writtenFilePaths: string[] = []

  Object.entries(allParams).forEach(([tier, params]) => {
    const name = `params-tier-${tier}.sol`
    const filePath = `../sol/files/${name}`
    fs.writeFileSync(filePath, params)
    writtenFilePaths.push(filePath)
  })

  return writtenFilePaths
}
