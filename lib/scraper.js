"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = require("cheerio");
const axios_1 = require("axios");
exports.parseTeamsFromRegion = (regionHtml, region) => {
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
exports.scrape = (urls) => Promise.all(urls.map(url => axios_1.default.get(url)));
//# sourceMappingURL=scraper.js.map