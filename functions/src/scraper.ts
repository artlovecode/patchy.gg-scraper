
import * as cheerio from 'cheerio';
import axios from 'axios';
import {Region, Team, Player, Role} from '../@types/types'

export const parseTeamsFromRegion = (regionHtml: string, region: Region): Team[] => {
  const $ = cheerio.load(regionHtml);
  const teams = $('.wikitable > tbody:nth-child(1) > tr').toArray();
  return teams.map((team) => {
    const $teamParser = cheerio.load(team);
    const name = $teamParser('.teamname > a').text();
    const currentActiveRoster = $teamParser('td:nth-child(3) a')
    return {
      name,
      currentActiveRoster: currentActiveRoster.toArray().map(e => cheerio(e).text()),
      currentActiveRosterLinks: currentActiveRoster.toArray().map(e => cheerio(e).attr('href')),
      region,
    };
  });
};

const mapStringToRole = (roleString:string): Role => {
  const map:Record<string, Role> = {
    'top laner': Role.TOP,
    'jungler': Role.JUNGLE,
    'mid laner': Role.MID,
    'bottom laner': Role.BOTTOM,
    'support': Role.SUPPORT
  }
  const role = map[roleString.toLowerCase()]

  if(!role) {
    throw new Error(`${roleString} is not a valid role`)
  }

  return role
}

const mapStringToRegion = (regionString:string): Region => {
  const map:Record<string, Region> = {
    'north america': Region.NA,
    'europe': Region.EU
  }

  const region = map[regionString.toLowerCase()]

  if(!Region[region]) {
    throw new Error(`${regionString.toLowerCase()} is not a valid region`)
  }

  return region
}

const InfoboxWrapper = (infoboxLabels:Cheerio) => {
  return {
    getTextFromHeading(heading: string): Cheerio {
      return infoboxLabels.filter(`:contains("${heading}")`)
    }
  }
}

export const parsePlayer = (html: string):Player => {
  const $playerParser = cheerio.load(html)
  const infobox = InfoboxWrapper($playerParser('.infobox-label'))
  const role = mapStringToRole(infobox.getTextFromHeading('Role').first().next().text())
  const residencyRegion = mapStringToRegion(
    infobox
     .getTextFromHeading('Residency')
     .next()
     .children()
     .contents()
     .filter((index, e) => e.type === 'text')
     .text()
     .trim()
  )

  const team = infobox
    .getTextFromHeading('Team')
    .first()
    .next()
    .text()
    .trim()

  const soloQIds = infobox
    .getTextFromHeading('Soloqueue IDs')
    .first()
    .next()
    .text()
    .trim()
    .split(',')
  
  return {
    ingameName: $playerParser('th.infobox-title').text(),
    role, 
    residencyRegion,
    team,
    soloQIds
  }
}

export const scrapePlayer = (url: string) => {
  return axios.get(url)
}


export const scrapeRegions = (urls: string[]) => Promise.all(urls.map(url => axios.get(url)));