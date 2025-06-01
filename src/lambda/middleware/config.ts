import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { am_in_lambda } from '../utils'
import { RequestHandler } from 'express'

export type ConfigType = {
  AUTH0_CLIENT_SECRET: string,
  AUTH0_CLIENT_ID: string,
  AUTH0_DOMAIN: string,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string,
  GOOGLE_PRIVATE_KEY: string,
  GOOGLE_WORKSPACE_EMAIL: string,
  JWT_SECRET: string,
  ENV: "dev" | "prod",
  COOKIE_EXPIRY: number,
  BASE_URL: string
}

let configData: ConfigType

export const configMiddleware: RequestHandler = async (req, res, next) => {
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
        res.locals.config = configData as ConfigType
        next()
    } catch (error) {
        console.log(error)
        throw error
    }
  }
/* 
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
} */