import * as scraper from '../src/scraper'
import {resolve} from 'url'
import {join} from 'path'
//@ts-ignore
const StaticServer = require('static-server')
import { Region, Role } from '../@types/types';


const PORT = 8080

const server = new StaticServer({
    rootPath: join(__dirname,'testServer'),
    host: 'localhost',
    port: PORT
})


beforeAll(
    () => {
        return new Promise((resolve, reject) => {
            server.start(() => {
                resolve()
            })
        })
    }
)

const serverReady = () => {
    return new Promise((resolve, reject) => {
        setInterval(() => server.open ? resolve() : console.log('not open'), 10)
    })
}


const ResponseHolder = async () => {
    await serverReady
    const baseUrl = `http://localhost:${PORT}`
    const endpoints = [
        '/na.html'
    ]
    const urls = endpoints.map(endpoint => resolve(baseUrl, endpoint))
    const responses = await scraper.scrapeRegions(urls)
    return responses.map(r => r.data).map(html => scraper.parseTeamsFromRegion(html, Region.NA))[0]
}

const responseHolder = ResponseHolder()


test('should parse teamnames correctly', async done => {
    expect.assertions(1)
    const naTeams = await responseHolder
    const naTeamNames = naTeams.map(t => t.name)
    expect(naTeamNames).toContain('Team SoloMid')
    done()
})

test('should find team roster', async done => {
    expect.assertions(1)
    const naTeams = await responseHolder
    const tsmRoster = naTeams.filter(t => t.name === 'Team SoloMid')[0].currentActiveRoster.entries
    const correct = ['BrokenBlade', 'Akaadian', 'Grig', 'Bjergsen', 'Zven', 'Smoothie'].entries
    expect(tsmRoster).toEqual(correct)
    done()
})

test('should find links to player pages', async done => {
    expect.assertions(1)
    const naTeams = await responseHolder
    const rosterLinks = naTeams.map(team => ({
        teamName: team.name,
        rosterLinks: team.currentActiveRosterLinks
    }))
    const c9RosterLinks = rosterLinks.filter(team => team.teamName === 'Cloud9').map(e => e.rosterLinks)[0]
    expect(c9RosterLinks).toContain('https://lol.gamepedia.com/Goldenglue')
    done()
})

test('should get correct region from URL', () => {
    expect.assertions(1)
    const region = scraper.getRegionFromURL("https://lol.gamepedia.com/Category:North_American_Teams")
    expect(region).toEqual(Region.NA)
})

test('should find player info in player pages', async done => {
    expect.assertions(1)
    const naTeams = await responseHolder
    const playerLinks = naTeams
        .filter(({ currentActiveRosterLinks }) => currentActiveRosterLinks.length > 0)
        .map(team => team.currentActiveRosterLinks)
        .reduce((a, b) => a.concat(b))
    const playerHtml = await Promise.all(playerLinks.map(scraper.scrapePlayer).map(p => p.catch(() => null)))
    const players = playerHtml.map(html => scraper.parsePlayer(html))
    const amazing = players.find(p => p && p.ingameName === 'Amazing')
    expect(amazing).toEqual({
        ingameName: 'Amazing',
        role: Role.JUNGLE,
        residencyRegion: Region.NA,
        team: '100 Thieves',
        soloQIds: [ "FNC Amazingx", "OG Amazing (KR)", "TSM Amazingx (KR)" ]
    })
    done()
}, 600000)

afterAll(() => {
    server.stop()
})