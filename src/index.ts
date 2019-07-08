import consola from 'consola'
import { APIGatewayEvent, Context, Callback, Handler } from 'aws-lambda'
import { scrapeRegions, parseTeamsFromRegion } from './scraper'
import { Region } from '../@types/types'

consola.wrapAll()

export const scrape: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
) => {
  const regionHTMLs = await scrapeRegions([])
  const teamsByRegions = regionHTMLs
    .map(response => response.data)
    .map(html => parseTeamsFromRegion(html, Region.NA))
  const playersByTeam = teamsByRegions
}
