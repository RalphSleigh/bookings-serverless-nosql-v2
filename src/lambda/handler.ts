import serverlessExpress from '@codegenie/serverless-express'

import { app } from './app'
import { AWSLoggerInstance } from './middleware/logger'
import { Context, Callback } from 'aws-lambda'

export const handler = async (event: any, context: Context, callback: Callback<any>) => {
    const result = serverlessExpress({ app })(event, context, callback)
    await AWSLoggerInstance.flush()
    return result
}
