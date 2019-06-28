import * as functions from 'firebase-functions';
import {Region} from '../@types/types'
import {scrape, parseTeamsFromRegion} from './scraper'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const scrapeTeams = functions.pubsub
  .schedule('0 0 * * *')
  .onRun((context) => {
    console.info(`Scrape requested by: ${context.auth ? context.auth.uid : 'UNKNOWN USER'}`)
    console.info(`Scrape requested at ${context.timestamp}`)

    if(!context.auth) {
      console.error('User not authenticated / unknownuser. Skipping scrape')
      return
    }

    const urls = [
      'https://lol.gamepedia.com/Category:North_American_Teams'
    ]
    console.info(`Scraping ${urls.length} base urls`)

    scrape(urls)
      .then(responses => {
        responses.map(response=> {
          const team = parseTeamsFromRegion(response.data, Region.NA)
          console.log(team)
        })
      })
  })
