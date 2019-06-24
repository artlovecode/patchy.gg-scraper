
import * as cheerio from 'cheerio';
import axios from 'axios';
import {Region, Team} from './@types/types'

export const parseTeamsFromRegion = (regionHtml: string, region: Region): Team[] => {
  const $ = cheerio.load(regionHtml);
  const teams = $('.wikitable > tbody:nth-child(1) > tr').toArray();

  return teams.map((team) => {
    const $teamParser = cheerio.load(team);
    const name = $teamParser('.teamname > a').text();
    const currentActiveRoster = $teamParser('td:nth-child(3) a').toArray().map(e => cheerio(e).text());
    return {
      name,
      currentActiveRoster,
      region,
    };
  });
};

export const scrape = (urls: string[]) => Promise.all(urls.map(url => axios.get(url)));