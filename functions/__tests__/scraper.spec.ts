import * as scraper from '../src/scraper'
import {resolve} from 'url'
import {join} from 'path'
//@ts-ignore
const StaticServer = require('static-server')
import { Region } from '../@types/types';


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

test('should parse teamnames correctly', async done => {
    expect.assertions(1)
    const baseUrl = `http://localhost:${PORT}`
    const endpoints = [
        '/na.html'
    ]
    const urls = endpoints.map(endpoint => resolve(baseUrl, endpoint))
    const responses = await scraper.scrape(urls)
    const naTeams = responses.map(r => r.data).map(html => scraper.parseTeamsFromRegion(html, Region.NA))[0]
    const naTeamNames = naTeams.map(t => t.name)
    expect(naTeamNames).toContain('Team SoloMid')
    done()
})

// test('should find team roster')

// test('should find detailed info about players')

afterAll(() => {
    server.stop()
})