import { DynamoDBClient, GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { am_in_lambda } from './utils'
import middy from '@middy/core'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'


export type ConfigType = {
  APPLE_CLIENT_ID: string,
  APPLE_CLIENT_SECRET: string,
  APPLE_KEY_ID: string,
  APPLE_TEAM_ID: string,
  BASE_URL: string,
  COOKIE_EXPIRY: number,
  DISCORD_ENABLED: boolean,
  DISCORD_BOT_TOKEN: string,
  DISCORD_GUILD_ID: string,
  DISCORD_CHANNEL_ID: string,
  DISCORD_WEBHOOK_URL: string,
  DISCORD_PUBLIC_KEY: string,
  DRIVE_SYNC_ENABLED: boolean,
  EMAIL_ENABLED: boolean,
  EMAIL_FROM: string,
  EMAIL_CLIENT_EMAIL: string,
  EMAIL_PRIVATE_KEY: string,
  ENV: string,
  FACEBOOK_CLIENT_ID: string,
  FACEBOOK_CLIENT_SECRET: string,
  GOOGLE_CLIENT_ID: string,
  GOOGLE_CLIENT_SECRET: string,
  JWT_SECRET: string,
  MICROSOFT_CLIENT_ID: string,
  MICROSOFT_CLIENT_SECRET: string,
  YAHOO_CLIENT_ID: string,
  YAHOO_CLIENT_SECRET: string,
  STRIPE_SECRET_KEY: string,
  STRIPE_WEBHOOK_SECRET: string,
}

let configData: ConfigType

export type ContextWithConfig = Context & { config: ConfigType }

export const configMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult, Error, ContextWithConfig> => {

  const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult, Error, ContextWithConfig> = async (
    request
  ): Promise<void> => {
    try {
        if(!configData) {
        const dynamodbClientOptions = am_in_lambda() ? { region: 'eu-west-2' } : { region: 'eu-west-2', endpoint: 'http://localhost:8000' }
        const client = new DynamoDBClient(dynamodbClientOptions)

        const input = {
            "Key": {
              "pk": {
                "S": "CONFIG"
              },
              "key": {
                "S": "CURRENT"
              }
            },
            "TableName": "Config"
          };

        const command = new GetItemCommand(input)
        const data = await client.send(command)
        configData = unmarshall(data.Item!) as ConfigType
        }
        request.context.config = configData as ConfigType
    } catch (error) {
        console.log(error)
        throw error
    } finally {
        // finally.
    }
  }
  return {
    before
  }
}