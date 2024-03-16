import { getAllParams } from './params'
import fs from 'fs'

export const writeAllParamFiles = (allParams: Awaited<ReturnType<typeof getAllParams>>) => {
  Object.entries(allParams).forEach(([tier, params]) => {
    const name = `params-tier-${tier}.sol`
    fs.writeFileSync(`../sol/files/${name}`, params)
  })
}
