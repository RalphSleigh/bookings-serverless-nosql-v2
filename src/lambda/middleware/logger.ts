//import { CloudWatchLogsClient, PutLogEventsCommand, PutLogEventsCommandOutput, CreateLogStreamCommand  } from "@aws-sdk/client-cloudwatch-logs"
import { RequestHandler, Request } from "express"
import { am_in_lambda } from "../utils"
/* 
const seeLogStreams = new Set()

const cloudWatchLogsClient = new CloudWatchLogsClient({ region: 'eu-west-2' })

class AWSLogger {
    private tasks: Promise<any>[] = []
    constructor(private req: Request) {
        this.req = req
    }

    logToPath(message: string) {
        console.log(`[${this.req.path}][${this.req.method}] ${message}`)
        const logStreamName = `${this.req.method}-${this.req.path}`
        if (!seeLogStreams.has(logStreamName)) {
            seeLogStreams.add(logStreamName)
            const task = cloudWatchLogsClient.send(new CreateLogStreamCommand({
                logGroupName: 'bookings_system_logs',
                logStreamName
            })).then(() => {
                return cloudWatchLogsClient.send(new PutLogEventsCommand({
                    logGroupName: 'bookings_system_request_logs',
                    logStreamName,
                    logEvents: [{ message, timestamp: Date.now() }]
                }))
            })
            this.tasks.push(task)
        } else {
            const task = cloudWatchLogsClient.send(new PutLogEventsCommand({
                logGroupName: 'bookings_system_request_logs',
                logStreamName,
                logEvents: [{ message, timestamp: Date.now() }]
            }))
            this.tasks.push(task)
        }
    }

    logToSystem(message: string) {
        console.log(`[system] ${message}`)
        const task = cloudWatchLogsClient.send(new PutLogEventsCommand({
            logGroupName: 'bookings_system_logs',
            logStreamName: 'system',
            logEvents: [{ message, timestamp: Date.now() }]
        }))

        this.tasks.push(task)
        
    }

    async flush() {
        await Promise.all(this.tasks)
    }
}
 */
class ConsoleLogger {
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
    if(am_in_lambda()) {
        res.locals.logger = new ConsoleLogger(req)
        //res.locals.logger = new AWSLogger(req)
        res.locals.logger.logToPath(`Request started at ${new Date().toISOString()}`)
        res.on('finish', async () => {
            res.locals.logger.logToPath(`Request finished with status ${res.statusCode} at ${new Date().toISOString()}`)
            await res.locals.logger.flush()
        })
    } else {
        res.locals.logger = new ConsoleLogger(req)
        res.locals.logger.logToPath(`Request started at ${new Date().toISOString()}`)
        res.on('finish', () => {
            res.locals.logger.logToPath(`Request finished with status ${res.statusCode} at ${new Date().toISOString()}`)
        })
    }
    next()
  } catch (error) {
    console.log(error)
    throw error
  }
}
