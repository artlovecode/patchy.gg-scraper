import * as cheerio from 'cheerio'
import axios from 'axios'
import { Region, Role, Team, Player } from '../@types/types'

export const parseTeamsFromRegion = (
  regionHtml: string,
  region: Region
): Team[] => {
  const $ = cheerio.load(regionHtml)
  const teams = $('.wikitable > tbody:nth-child(1) > tr').toArray()
  return teams.map(team => {
    const $teamParser = cheerio.load(team)
    const name = $teamParser('.teamname > a').text()
    const currentActiveRoster = $teamParser('td:nth-child(3) a')
    return {
      name,
      currentActiveRoster: currentActiveRoster
        .toArray()
        .map(e => cheerio(e).text()),
      currentActiveRosterLinks: currentActiveRoster
        .toArray()
        .map(e => cheerio(e).attr('href')),
      region
    }
  })
}

const mapStringToRole = (roleString: string): Role => {
  const map: Record<string, Role> = {
    'top laner': Role.TOP,
    jungler: Role.JUNGLE,
    'mid laner': Role.MID,
    'bot laner': Role.BOTTOM,
    support: Role.SUPPORT
  }
  const role = map[roleString.toLowerCase()]

  if (!Role[role]) {
    return Role.NONE
  }

  return role
}

const mapStringToRegion = (regionString: string): Region => {
  const map: Record<string, Region> = {
    'north america': Region.NA,
    europe: Region.EU,
    korea: Region.KR,
    brazil: Region.BR,
    oceania: Region.OCE,
    turkey: Region.TR,
    japan: Region.JP,
    china: Region.CN
  }

  const region = map[regionString.toLowerCase()]

  if (!Region[region]) {
    return Region.NONE
  }

  return region
}

export const parsePlayer = (html: string): Player | null => {
  if (!html) {
    return null
  }
  const $playerParser = cheerio.load(html)
  const infoboxLabels = $playerParser('.infobox-label')

  const role = mapStringToRole(
    infoboxLabels
      .filter(':contains("Role")')
      .first()
      .next()
      .text()
  )

  const residencyRegion = mapStringToRegion(
    infoboxLabels
      .filter(':contains("Residency")')
      .next()
      .children()
      .contents()
      .filter((index, e) => e.type === 'text')
      .text()
      .trim()
  )

  const team = infoboxLabels
    .filter(':contains("Team")')
    .first()
    .next()
    .text()
    .trim()

  const soloQIds = infoboxLabels
    .filter(':contains("Soloqueue IDs")')
    .first()
    .next()
    .text()
    .trim()
    .split(',')
    .map(str => str.trim())

  return {
    ingameName: $playerParser('th.infobox-title').text(),
    role,
    residencyRegion,
    team,
    soloQIds
  }
}

export const scrapePlayer = (url: string) => {
  return axios.get(url).then(response => response.data)
}

export const scrapeRegions = (urls: string[]) =>
  Promise.all(urls.map(url => axios.get(url)))
