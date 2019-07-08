import consola from 'consola'
import { scrapeRegions, parseTeamsFromRegion } from './scraper'
import { Region } from '../@types/types'

consola.wrapAll()

export const scrapeTeams = (event: any, context: any, callback: any) => {

