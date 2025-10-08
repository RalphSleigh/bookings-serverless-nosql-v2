import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import { Context, SQSBatchItemFailure, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { serializeError } from 'serialize-error'

import { asyncTasksExecutor } from './asyncTasks/asyncTasksExecutor'
import { am_in_lambda } from './utils'

export const handler = async (event: SQSEvent, context: Context): Promise<SQSBatchResponse> => {
  const batchItemFailures: SQSBatchItemFailure[] = []

  for (const record of event.Records) {
    try {
      const data = JSON.parse(record.body)
      await asyncTasksExecutor(data)
    } catch (error) {
      console.error(`Error processing record ${record.messageId}:`, error)
      if (am_in_lambda()) {
        const client = new SNSClient({})
        const input = {
          // PublishInput
          TopicArn: process.env.SNS_QUEUE_ARN,
          Message: JSON.stringify(serializeError(error)),
        }
        const command = new PublishCommand(input)
        const response = await client.send(command)
      }
      batchItemFailures.push({ itemIdentifier: record.messageId })
    }
  }

  return { batchItemFailures: batchItemFailures }
}
