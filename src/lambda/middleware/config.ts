import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { RequestHandler } from 'express'

import { getConfig } from '../getConfig'
import { am_in_lambda } from '../utils'

export const configMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const config = await getConfig()
    res.locals.config = config
    next()
  } catch (error) {
    res.locals.logger.logToPath(error)
    throw error
  }
}
