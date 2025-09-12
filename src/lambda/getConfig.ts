import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { RequestHandler } from 'express'

import { am_in_lambda } from './utils'

export type ConfigType = {
  AUTH0_CLIENT_SECRET: string
  AUTH0_CLIENT_ID: string
  AUTH0_DOMAIN: string
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string
  GOOGLE_IDENTITY_POOL_AUDIENCE: string
  GOOGLE_WORKSPACE_EMAIL: string
  JWT_SECRET: string
  ENV: 'dev' | 'prod'
  COOKIE_EXPIRY: number
  BASE_URL: string,
  EMAIL_ENABLED: boolean
}

let configData: ConfigType

export const getConfig: () => Promise<ConfigType> = async () => {
  try {
    if (!configData) {
      const dynamodbClientOptions = am_in_lambda() ? { region: 'eu-west-2' } : { region: 'eu-west-2', endpoint: 'http://localhost:8000' }
      const client = new DynamoDBClient(dynamodbClientOptions)

      const input = {
        Key: {
          pk: {
            S: 'CONFIG',
          },
          key: {
            S: 'CURRENT',
          },
        },
        TableName: 'Config',
      }

      const command = new GetItemCommand(input)
      const data = await client.send(command)
      configData = unmarshall(data.Item!) as ConfigType
    }
    return configData
  } catch (error) {
    console.log(error)
    throw error
  }
}
