import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'

import { am_in_lambda } from '../utils'
import { asyncTasksExecutor } from './asyncTasksExecutor'

export type EmailBookingCreatedTask = {
  type: 'emailBookingCreated'
  data: {
    eventId: string
    userId: string
  }
}

export type EmailBookingUpdatedTask = {
  type: 'emailBookingUpdated'
  data: {
    eventId: string
    userId: string
  }
}

export type DriveSyncTask = {
  type: 'driveSync'
  data: {
    eventId: string
  }
}

export type AsyncTask = EmailBookingCreatedTask | EmailBookingUpdatedTask | DriveSyncTask 

export const enqueueAsyncTask = async (task: AsyncTask) => {
  if (am_in_lambda()) {
    const command = new SendMessageCommand({
      QueueUrl: process.env.ASYNC_TASK_QUEUE_URL,
      MessageBody: JSON.stringify(task),
    })
    const client = new SQSClient()
    await client.send(command)
  } else {
    await asyncTasksExecutor(task)
  }
}
