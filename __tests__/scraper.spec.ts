import { resolve } from 'url'
import { join } from 'path'
import * as scraper from '../src/scraper/scraper'
import { Region, Role} from '../@types/types'
//@ts-ignore
const StaticServer = require('static-server')

const PORT = 8080

const server = new StaticServer({
  rootPath: join(__dirname, 'testServer'),
  host: 'localhost',
  port: PORT
})


const serverReady = () => {
  return new Promise(promiseResolve => {
    setInterval(
      () => (server.open ? promiseResolve() : console.log('not open')),
      10
    )
  })
}

const ResponseHolder = async () => {
  await serverReady
  const baseUrl = `http://localhost:${PORT}`
  const endpoints = ['/na.html']
  const urls = endpoints.map(endpoint => resolve(baseUrl, endpoint))
  try {
    const responses = await scraper.scrapeRegions(urls)
    return responses.map(( { data } ) => new scraper.TeamGetter(data , Region.NA).getTeams())[0]
  } catch(e) {
    throw e
  }
}

beforeAll(() => {
  return new Promise(promiseResolve => {
    server.start(() => {
      promiseResolve()
    })
  })
})


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
  const tsmRoster = naTeams.filter(t => t.name === 'Team SoloMid')[0]
    .currentActiveRoster.entries
  const correct = [
    'BrokenBlade',
    'Akaadian',
    'Grig',
    'Bjergsen',
    'Zven',
    'Smoothie'
  ].entries
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
  const c9RosterLinks = rosterLinks
    .filter(team => team.teamName === 'Cloud9')
    .map(e => e.rosterLinks)[0]
  expect(c9RosterLinks).toContain('https://lol.gamepedia.com/Goldenglue')
  done()
})

test('should get correct region from URL', () => {
  expect.assertions(1)
  const region = scraper.regionUrlMapper.find('https://lol.gamepedia.com/category:north_american_teams')
  expect(region).toEqual(Region.NA)
})

test('should find player info in player pages', async done => {
  expect.assertions(1)
  const naTeams = await responseHolder
  const playerLinks = naTeams
    .filter(
      ({ currentActiveRosterLinks }) => currentActiveRosterLinks.length > 0
    )
    .map(team => team.currentActiveRosterLinks)
    .reduce((a, b) => a.concat(b))

  const p = await scraper.scrapePlayer(playerLinks[0])

  const player = scraper.parsePlayer(p)
  expect(player).toEqual({
    ingameName: 'Amazing',
    role: Role.JUNGLE,
    residencyRegion: Region.NA,
    team: '100 Thieves',
    soloQIds: ['FNC Amazingx', 'OG Amazing (KR)', 'TSM Amazingx (KR)']
  })
  done()
}, 600000)

afterAll(() => {
  server.stop()
})
