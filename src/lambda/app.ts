import cookieParser from 'cookie-parser'
import express, { type ErrorRequestHandler } from 'express'

import { authCallback } from './endpoints/auth/callback'
import { logout } from './endpoints/auth/logout'
import { authRedirect } from './endpoints/auth/redirect'
import { cancelBooking } from './endpoints/booking/cancelBooking'
import { createBooking } from './endpoints/booking/createBooking'
import { createSheetForBookingEndpoint } from './endpoints/booking/createSheetForBooking'
import { getBookingHasSheet } from './endpoints/booking/getBookingHasSheet'
import { getDataFromSheetEndpoint } from './endpoints/booking/getDataFromSheet'
import { getUserBookings } from './endpoints/booking/getUserBookings'
import { updateBooking } from './endpoints/booking/updateBooking'
import { getEnv } from './endpoints/env'
import { logClientErrors } from './endpoints/errors'
import { createEvent } from './endpoints/event/createEvent'
import { editEvent } from './endpoints/event/editEvent'
import { getEvents } from './endpoints/event/getEvents'
import { createRole } from './endpoints/event/manage/createRole'
import { deleteRole } from './endpoints/event/manage/deleteRole'
import { getEventBookings } from './endpoints/event/manage/getEventBookings'
import { getEventRoles } from './endpoints/event/manage/getEventRoles'
import { getUsers } from './endpoints/event/manage/getUsers'
import { testCreateRole } from './endpoints/test/addAdminRole'
import { testLoggedIn } from './endpoints/test/testLoggedIn'
import { getUser } from './endpoints/user/getUser'
import { configMiddleware } from './middleware/config'
import { eventMiddleware } from './middleware/event'
import { loggerMiddleware, requestLoggerMiddleware } from './middleware/logger'
import { ownBookingMiddleware } from './middleware/ownBooking'
import { userMiddleware } from './middleware/user'
import { am_in_lambda } from './utils'
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import { serializeError } from 'serialize-error'

export const router = express.Router()
export const app = express()

router.use(loggerMiddleware)
router.use(express.json())
router.use(cookieParser())
router.use(configMiddleware)
router.use(userMiddleware)
router.use(requestLoggerMiddleware)

router.post('/error', logClientErrors)

router.get('/env', getEnv)
router.get('/auth/redirect', authRedirect)
router.get('/auth/callback', authCallback)
router.get('/user/current', getUser)
router.get('/user/logout', logout)
router.get('/user/bookings', getUserBookings)
//app.get('/test/loggedIn', testLoggedIn)
//
router.get('/test/createRole', testCreateRole)

router.get('/events', getEvents)
router.post('/event/create', createEvent)

router.use('/event/:eventId/{*splat}', [eventMiddleware, ownBookingMiddleware])
router.post('/event/:eventId/edit', editEvent)
router.post('/event/:eventId/booking/create', createBooking)
router.post('/event/:eventId/booking/update', updateBooking)
router.get('/event/:eventId/booking/:userId/sheet', getBookingHasSheet)
router.post('/event/:eventId/booking/:userId/sheet', createSheetForBookingEndpoint)
router.get('/event/:eventId/booking/:userId/sheet/data', getDataFromSheetEndpoint)
router.delete('/event/:eventId/booking/:userId', cancelBooking)

router.get('/event/:eventId/manage/bookings', getEventBookings)
router.get('/event/:eventId/manage/roles', getEventRoles)
router.get('/event/:eventId/manage/users', getUsers)
router.post('/event/:eventId/manage/role/create', createRole)
router.delete('/event/:eventId/manage/role/:roleId', deleteRole)

app.use('/', router)

const errorHandler: ErrorRequestHandler = async (err, req, res, next) => {
  if (am_in_lambda()) {
    const client = new SNSClient({})
    const input = {
      // PublishInput
      TopicArn: process.env.SNS_QUEUE_ARN,
      Message: JSON.stringify(err), // required
    }
    const command = new PublishCommand(input)
    const response = await client.send(command)
  }
  res.locals.logger.logToSystem('Error handler called')
  res.locals.logger.logToSystem(serializeError(err))
  next(err)
}
app.use(errorHandler)
