import { Handler } from 'aws-lambda'

const handler: Handler = async () => {
  return {
    body: JSON.stringify([
      {
        ingameName: 'Blahdiebluuu'
      }
    ]),
    statusCode: 200
  }
}

export default handler
