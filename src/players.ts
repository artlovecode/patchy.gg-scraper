import { Handler, Context, APIGatewayEvent } from 'aws-lambda'

const handler: Handler = async (event: APIGatewayEvent, context: Context) => {
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
