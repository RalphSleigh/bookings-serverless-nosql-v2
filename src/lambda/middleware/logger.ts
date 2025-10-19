import { CloudWatchLogsClient, CreateLogStreamCommand, PutLogEventsCommand, PutLogEventsCommandOutput } from '@aws-sdk/client-cloudwatch-logs'
import { Request, RequestHandler } from 'express'

import { am_in_lambda } from '../utils'

const seeLogStreams = new Set()

const cloudWatchLogsClient = new CloudWatchLogsClient({ region: 'eu-west-2' })

export interface Logger {
  logToPath(message: any): void
  logToSystem(message: any): void
  flush(): Promise<void>
}

class AWSLogger implements Logger {
  private tasks: Promise<any>[] = []
  createTask: Promise<PutLogEventsCommandOutput> | undefined
  constructor(private req: Request) {
    this.req = req
  }

  logToPath(message: any) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message)
    }
    console.log(`[${this.req.path}][${this.req.method}] ${message}`)
    const logStreamName = `${this.req.method}_${this.req.path}`
    if (!seeLogStreams.has(logStreamName)) {
      this.createTask = (async () => {
        try {
          await cloudWatchLogsClient.send(
            new CreateLogStreamCommand({
              logGroupName: 'bookings_system_request_logs',
              logStreamName,
            }),
          )
        } catch (error) {
          console.error('Error creating log stream:', error)
        }
      })().then(() => {
        return cloudWatchLogsClient.send(
          new PutLogEventsCommand({
            logGroupName: 'bookings_system_request_logs',
            logStreamName,
            logEvents: [{ message, timestamp: Date.now() }],
          }),
        )
      })
      seeLogStreams.add(logStreamName)
      this.tasks.push(this.createTask)
    } else {
      const task = (async () => {
        await this.createTask
        await cloudWatchLogsClient.send(
          new PutLogEventsCommand({
            logGroupName: 'bookings_system_request_logs',
            logStreamName,
            logEvents: [{ message, timestamp: Date.now() }],
          }),
        )
      })()
      this.tasks.push(task)
    }
  }

  logToSystem(message: any) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message)
    }
    console.log(`[system] ${message}`)
    const task = cloudWatchLogsClient.send(
      new PutLogEventsCommand({
        logGroupName: 'bookings_system_logs',
        logStreamName: 'system',
        logEvents: [{ message, timestamp: Date.now() }],
      }),
    )
    this.tasks.push(task)
  }

  async flush() {
    await Promise.all(this.tasks)
  }
}

class ConsoleLogger implements Logger {
  constructor(private req: Request) {
    this.req = req
  }

  logToPath(message: string) {
    console.log(`[${this.req.path}][${this.req.method}] ${message}`)
  }

  logToSystem(message: string) {
    console.log(`[system] ${message}`)
  }

  async flush() {
    // No-op for console logger
  }
}

export const loggerMiddleware: RequestHandler = async (req, res, next) => {
  try {
    if (am_in_lambda()) {
      res.locals.logger = new AWSLogger(req)
      res.locals.logger.logToPath(`Request started at ${new Date().toISOString()}`)
      next()
      await res.locals.logger.flush()
      /*       res.on('finish', async () => {
        res.locals.logger.logToPath(`Request finished with status ${res.statusCode} at ${new Date().toISOString()}`)
        await res.locals.logger.flush()
      }) */
    } else {
      res.locals.logger = new ConsoleLogger(req)
      res.locals.logger.logToPath(`Request started at ${new Date().toISOString()}`)
      res.on('finish', () => {
        res.locals.logger.logToPath(`Request finished with status ${res.statusCode} at ${new Date().toISOString()}`)
      })
      next()
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const requestLoggerMiddleware: RequestHandler = async (req, res, next) => {
  if (res.locals.user) {
    res.locals.logger.logToSystem(`User ${res.locals.user.name} called ${req.method}: ${req.path} (${req.headers['x-forwarded-for']})`)
  } else {
    res.locals.logger.logToSystem(`Anonymous user called ${req.method}: ${req.path} (${req.headers['x-forwarded-for']})`)
  }
  next()
}
