import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import cookieParser from 'cookie-parser'
import express, { type ErrorRequestHandler } from 'express'
import { serializeError } from 'serialize-error'

import { createApplicationEndpoint } from './endpoints/application/createApplicationEndpoint'
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
import { deleteEvent } from './endpoints/event/deleteEvent'
import { editEvent } from './endpoints/event/editEvent'
import { getEvents } from './endpoints/event/getEvents'
import { approveApplicationEndpoint } from './endpoints/event/manage/approveApplication'
import { createFeeItem } from './endpoints/event/manage/createFeeItem'
import { createRole } from './endpoints/event/manage/createRole'
import { declineApplicationEndpoint } from './endpoints/event/manage/declineApplication'
import { deleteFeeItem } from './endpoints/event/manage/deleteFeeItem'
import { deleteRole } from './endpoints/event/manage/deleteRole'
import { getEventApplications } from './endpoints/event/manage/getEventApplications'
import { getEventBookingHistory } from './endpoints/event/manage/getEventBookingHistory'
import { getEventBookings } from './endpoints/event/manage/getEventBookings'
import { getEventFees } from './endpoints/event/manage/getEventFees'
import { getEventRoles } from './endpoints/event/manage/getEventRoles'
import { getUsers } from './endpoints/event/manage/getUsers'
import { getUser } from './endpoints/user/getUser'
import { updateUserPreference } from './endpoints/user/updateUserPreference'
import { configMiddleware } from './middleware/config'
import { eventMiddleware } from './middleware/event'
import { loggerMiddleware, requestLoggerMiddleware } from './middleware/logger'
import { ownBookingMiddleware } from './middleware/ownBooking'
import { userMiddleware } from './middleware/user'
import { am_in_lambda } from './utils'

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
router.post('/user/updateUserPreference', updateUserPreference)

//app.get('/test/loggedIn', testLoggedIn)
//router.get('/test/createRole', testCreateRole)

router.get('/events', getEvents)
router.post('/event/create', createEvent)

router.use('/event/:eventId/{*splat}', [eventMiddleware, ownBookingMiddleware])
router.post('/event/:eventId/edit', editEvent)
router.delete('/event/:eventId/delete', deleteEvent)
router.post('/event/:eventId/booking/create', createBooking)
router.post('/event/:eventId/booking/update', updateBooking)
router.get('/event/:eventId/booking/:userId/sheet', getBookingHasSheet)
router.post('/event/:eventId/booking/:userId/sheet', createSheetForBookingEndpoint)
router.get('/event/:eventId/booking/:userId/sheet/data', getDataFromSheetEndpoint)
router.delete('/event/:eventId/booking/:userId', cancelBooking)

router.post('/event/:eventId/application/create', createApplicationEndpoint)

router.get('/event/:eventId/manage/bookings', getEventBookings)
router.get('/event/:eventId/manage/roles', getEventRoles)
router.get('/event/:eventId/manage/users', getUsers)
router.post('/event/:eventId/manage/role/create', createRole)
router.delete('/event/:eventId/manage/role/:roleId', deleteRole)
router.get('/event/:eventId/manage/fees', getEventFees)
router.post('/event/:eventId/manage/fee/create', createFeeItem)
router.delete('/event/:eventId/manage/fee/:feeId', deleteFeeItem)
router.get('/event/:eventId/manage/applications', getEventApplications)
router.post('/event/:eventId/manage/application/:userId/approve', approveApplicationEndpoint)
router.post('/event/:eventId/manage/application/:userId/decline', declineApplicationEndpoint)
router.get('/event/:eventId/manage/bookingHistory/:userId', getEventBookingHistory)

const errorHandler: ErrorRequestHandler = async (err, req, res, next) => {
  const message = {
    err: serializeError(err),
    message: err.message,
    stack: err.stack,
    user: res.locals.user,
    url: req.originalUrl,
    userAgent: req.headers['user-agent'],
  }

  if (am_in_lambda()) {
    const client = new SNSClient({})
    const input = {
      // PublishInput
      TopicArn: process.env.SNS_QUEUE_ARN,
      Message: JSON.stringify(message), // required
    }
    const command = new PublishCommand(input)
    const response = await client.send(command)
  }
  res.locals.logger.logToSystem('Error handler called')
  res.locals.logger.logToSystem(JSON.stringify(message))
  next(err)
}
router.use(errorHandler)
app.use('/', router)
