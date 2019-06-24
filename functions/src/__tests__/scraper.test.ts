import * as scraper from '../scraper'
import axios from 'axios'
import {resolve} from 'url'
//@ts-ignore
import StaticServer from 'static-server'
import { Region } from '../@types/types';

const PORT = process.env.PORT || 8080

beforeAll(
    (done) => {
        const server = new StaticServer({
            rootPath: './testServer/',
            port: PORT
        })
        server.start(() => done())
    }
)

test('should parse teamnames correctly', () => {
    expect.assertions(1)
    const baseUrl = `localhost:${PORT}`
    const endpoints = [
        '/na'
    ]
    const responses = scraper.scrape(endpoints.map(endpoint => resolve(baseUrl, endpoint)))
    return responses.then(responses => {
        const naTeams = responses.map(r => r.data).map(html => scraper.parseTeamsFromRegion(html, Region.NA))[0]
        const naTeamNames = naTeams.map(t => t.name)

        expect(naTeamNames.includes('Team SoloMid'))
    })
})