"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const types_1 = require("./@types/types");
const scraper_1 = require("./scraper");
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.scrapeTeams = functions.pubsub
    .schedule('0 0 * * *')
    .onRun((context) => {
    console.info(`Scrape requested by: ${context.auth ? context.auth.uid : 'UNKNOWN USER'}`);
    console.info(`Scrape requested at ${context.timestamp}`);
    if (!context.auth) {
        console.error('User not authenticated / unknownuser. Skipping scrape');
        return;
    }
    const urls = [
        'https://lol.gamepedia.com/Category:North_American_Teams'
    ];
    console.info(`Scraping ${urls.length} base urls`);
    scraper_1.scrape(urls)
        .then(responses => {
        responses.map(response => {
            const team = scraper_1.parseTeamsFromRegion(response.data, types_1.Region.NA);
            console.log(team);
        });
    });
});
//# sourceMappingURL=index.js.map