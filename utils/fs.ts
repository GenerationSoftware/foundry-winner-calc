import { getAllParams } from "./params"
import { join } from "path"
import fs from "fs"

export const writeAllParamFiles = (allParams: Awaited<ReturnType<typeof getAllParams>>, projectDir: string) => {
  const writtenFilePaths: [number, string][] = []

  Object.entries(allParams).forEach(([tier, params]) => {
    const filePath = join(projectDir, `./sol/files/tier-${tier}-params.txt`)
    fs.writeFileSync(filePath, params)
    writtenFilePaths.push([parseInt(tier), filePath])
  })

  return writtenFilePaths
}
