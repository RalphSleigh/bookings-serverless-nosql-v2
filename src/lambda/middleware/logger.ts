import { CloudWatchLogsClient, CreateLogStreamCommand, PutLogEventsCommand, PutLogEventsCommandOutput } from '@aws-sdk/client-cloudwatch-logs'
import { Request, RequestHandler, Response } from 'express'

import { am_in_lambda } from '../utils'

const seeLogStreams: Record<string, Promise<any>> = {}

const cloudWatchLogsClient = new CloudWatchLogsClient({ region: 'eu-west-2' })

export interface Logger {
  logToPath(message: any): void
  logToSystem(message: any): void
  flush(): Promise<void>
}

class AWSLogger implements Logger {
  private tasks: Promise<any>[] = []
  createTask: Promise<PutLogEventsCommandOutput> | undefined
  req?: Request
  res?: Response

  constructor() {}

  setRequests(req: Request, res: Response) {
    this.req = req
    this.res = res
  }

  logToPath(message: any) {
    if (!this.req) {
      console.log('Request not set in logger')
      console.log(message)
      return
    }
    if (typeof message !== 'string') {
      message = JSON.stringify(message)
    }
    console.log(`[${this.req.path}][${this.req.method}] ${message}`)
    const logStreamName = `${this.req.method}_${this.req.path}`

    if (!seeLogStreams[logStreamName]) {
      seeLogStreams[logStreamName] = (async () => {
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
      })()
    }

    const logTask = seeLogStreams[logStreamName].then(async () => {
      console.log('Logging to CloudWatch:', message)
      await cloudWatchLogsClient.send(
        new PutLogEventsCommand({
          logGroupName: 'bookings_system_request_logs',
          logStreamName,
          logEvents: [{ message, timestamp: Date.now() }],
        }),
      )
      console.log('Logged to CloudWatch')
    })

    this.tasks.push(logTask)
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
    this.logToPath(`Request finished with status ${this.res?.statusCode} at ${new Date().toISOString()}`)
    console.log('Flushing logs', this.tasks.length, 'tasks')
    await Promise.all(this.tasks)
    console.log('Flushed logs')
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

export const AWSLoggerInstance = new AWSLogger()

export const loggerMiddleware: RequestHandler = async (req, res, next) => {
  try {
    if (am_in_lambda()) {
      res.locals.logger = AWSLoggerInstance
      res.locals.logger.setRequests(req, res)
      res.locals.logger.logToPath(`Request started at ${new Date().toISOString()}`)
      next()
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
    res.locals.logger.logToPath(`User ${res.locals.user.name} ${res.locals.user.userId} called ${req.method}: ${req.path} (${req.headers['x-forwarded-for']})`)
    res.locals.logger.logToPath(`User agent: ${req.headers['user-agent']}`)
  } else {
    res.locals.logger.logToSystem(`Anonymous user called ${req.method}: ${req.path} (${req.headers['x-forwarded-for']})`)
    res.locals.logger.logToPath(`Anonymous user called ${req.method}: ${req.path} (${req.headers['x-forwarded-for']})`)
    res.locals.logger.logToPath(`User agent: ${req.headers['user-agent']}`)
  }
  next()
}
