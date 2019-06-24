import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const scrapeTeams = functions.https.onRequest((req, res) => {
    const regionUrls = [
       "https://lol.gamepedia.com/Category:North_American_Teams"
    ]
})
