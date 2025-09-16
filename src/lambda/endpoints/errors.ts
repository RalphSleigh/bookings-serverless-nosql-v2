import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'

import { am_in_lambda, HandlerWrapper } from '../utils.js'

export const logClientErrors = HandlerWrapper(
  (res) => ['get', 'errors'],
  async (req, res) => {
    const errorJson = {
      message: req.body.message,
      from: req.body.from,
      userAgent: req.headers['user-agent'],
      url: req.body.url,
      user: res.locals.user,
    }

    res.locals.logger.logToPath(`CLIENT ERROR from ${res.locals.currentUser?.userName}: ${JSON.stringify(errorJson)}`)

    if (!am_in_lambda()) return res.json({})

    const client = new SNSClient({})
    const input = {
      // PublishInput
      TopicArn: process.env.SNS_QUEUE_ARN,
      Message: JSON.stringify(errorJson), // required
    }
    const command = new PublishCommand(input)
    const response = await client.send(command)
    return res.json({})
  },
)
