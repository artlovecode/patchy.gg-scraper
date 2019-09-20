import { Handler } from 'aws-lambda'
import { scrapeRegions, TeamGetter } from './scraper/scraper'
import { Region } from '../@types/types'

export const handler: Handler = async (): Promise<Record<string, any>> => {
  const regionHTMLs = await scrapeRegions([
    'https://lol.gamepedia.com/Category:North_American_Teams'
  ])
  const teamsByRegions = regionHTMLs
    .map(html => new TeamGetter(html, Region.NA).getTeams())

  return {
    body: JSON.stringify({
      data: teamsByRegions
    }),
    statusCode: 200
  }
}
