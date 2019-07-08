import { APIGatewayEvent, Context, Callback, Handler } from 'aws-lambda'
import { scrapeRegions, parseTeamsFromRegion } from './scraper/scraper'
import { Region } from '../@types/types'

export const handler: Handler = async (
  event: APIGatewayEvent,
  context: Context
) => {
  const regionHTMLs = await scrapeRegions(['https://lol.gamepedia.com/Category:North_American_Teams'])
  const teamsByRegions = regionHTMLs
    .map(response => response.data)
    .map(html => parseTeamsFromRegion(html, Region.NA))
  
  return {
    body: JSON.stringify({
      data: teamsByRegions
    }),
    statusCode: 200
  }
}
