import * as cheerio from 'cheerio'
import axios from 'axios'
import { Region, Role, Team, Player } from '../../@types/types'


class Mapper<T>{
  public map: Record<string, T>

  constructor(map: Record<string, T>) {
    this.map = map
  }

  find(item: string): T | null {
    const foundItem = this.map[item]

    if (foundItem === undefined) {
      return null
    }

    return foundItem
  }
}

const regionURLs: Record<string, Region> = {
  'https://lol.gamepedia.com/Category:North_American_Teams': Region.NA,
  'https://lol.gamepedia.com/Category:Chinese_Teams': Region.CN,
  'https://lol.gamepedia.com/Category:Korean_Teams': Region.KR,
  'https://lol.gamepedia.com/Category:LMS_Teams': Region.LMS,
  'https://lol.gamepedia.com/Category:Brazilian_Teams': Region.BR,
  'https://lol.gamepedia.com/Category:CIS_Teams': Region.CIS,
  'https://lol.gamepedia.com/Category:Japanese_Teams': Region.JP,
  'https://lol.gamepedia.com/Category:Latin_American_Teams': Region.LAT,
  'https://lol.gamepedia.com/Category:Oceanic_Teams': Region.OCE,
  'https://lol.gamepedia.com/Category:Southeast_Asian_Teams': Region.SEA,
  'https://lol.gamepedia.com/Category:Turkish_Teams': Region.TR,
  'https://lol.gamepedia.com/Category:Vietnamese_Teams': Region.VN,
  'https://lol.gamepedia.com/Category:European_Teams': Region.EU
}


const roleMap: Record<string, Role> = {
  'top laner': Role.TOP,
  jungler: Role.JUNGLE,
  'mid laner': Role.MID,
  'bot laner': Role.BOTTOM,
  support: Role.SUPPORT
}

const regionMap: Record<string, Region> = {
  'north america': Region.NA,
  europe: Region.EU,
  korea: Region.KR,
  brazil: Region.BR,
  oceania: Region.OCE,
  turkey: Region.TR,
  japan: Region.JP,
  china: Region.CN,
  vietnam: Region.VN,
  'southeast asia': Region.SEA
}


export const regionUrlMapper = new Mapper<Region>(regionURLs)


export class TeamGetter {
  private parser: CheerioStatic
  private region: Region
  constructor(regionHtml: string, region: Region) {
    this.region = region
    this.parser = cheerio.load(regionHtml)
  }

  parseTeam(teamHtml: CheerioElement ): Team {
    const teamParser = cheerio.load(teamHtml)
    const name = teamParser('.teamname > a').text()
    const rosterHtml = teamParser('td:nth-child(3) a').toArray()
    const currentActiveRoster = rosterHtml
      .map((html): string => cheerio(html).text())
    const currentActiveRosterLinks = rosterHtml
      .map((html): string => cheerio(html).attr('href'))

    return {
      name, currentActiveRoster, currentActiveRosterLinks, region: this.region
    }
  }

  getTeams(): Team[] {
    const teamHtmls = this.parser('.wikitable > tbody:nth-child(1) > tr').toArray()
    return teamHtmls.map((html) => this.parseTeam(html))
  }
}

class PlayerInbox {
  private parser: CheerioStatic
  public infoBoxLabels: Cheerio
  private regionMapper: Mapper<Region>
  private roleMapper: Mapper<Role>
  constructor(html: string) {
    this.parser = cheerio.load(html)
    this.infoBoxLabels = this.parser('.infobox-labels')

    this.regionMapper = new Mapper<Region>(regionMap)
    this.roleMapper = new Mapper<Role>(roleMap)
  }
  getName(): string {
    return this.parser('th.infobox-title').text()
  }
  getRole(): Role | null {
    const roleNode = this.parser('.infobox-label')
      .filter(':contains("Role")')

    const roleText = roleNode.first().next().text()
    return this.roleMapper.find(roleText.toLowerCase())
  }
  getResidencyRegion(): Region | null {
    const regionText = this.parser('.infobox-label')
      .filter(':contains("Residency")')
      .next()
      .children()
      .contents()
      .filter((index, e): boolean => e.type === 'text')
      .text()
      .trim()
    return this.regionMapper.find(regionText.toLowerCase())
  }
  getTeam(): string {
    return this.parser('.infobox-label')
      .filter(':contains("Team")')
      .first()
      .next()
      .text()
      .trim()
  }
  getSoloQIds(): string[] {
    return this.parser('.infobox-label')
      .filter(':contains("Soloqueue IDs")')
      .first()
      .next()
      .text()
      .trim()
      .split(',')
      .map((str): string => str.trim())
  }
}


export const parsePlayer = (html: string | null): Player | null => {
  if (!html) {
    return null
  }
  const infoBox = new PlayerInbox(html)

  const role = infoBox.getRole()
  const residencyRegion = infoBox.getResidencyRegion()
  const team = infoBox.getTeam()
  const soloQIds = infoBox.getSoloQIds() 
  const ingameName = infoBox.getName()

  if (ingameName === 'Amazing') {
    console.log(infoBox.infoBoxLabels.html())
  }

  return {
    ingameName,
    role,
    residencyRegion,
    team,
    soloQIds
  }
}

export const scrapePlayer = (url: string): Promise<string> =>
  axios.get(url).then((response): string => response.data)

export const scrapeRegions = (urls: string[]): Promise<any[]> =>
  Promise.all(urls.map((url:any): Promise<string> => axios.get(url)))
