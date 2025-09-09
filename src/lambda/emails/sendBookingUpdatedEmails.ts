import { EventSchema } from '../../shared/schemas/event'
import { TUser } from '../../shared/schemas/user'
import { EmailBookingUpdatedTask } from '../asyncTasks/asyncTaskQueuer'
import { DB, DBBooking, DBEvent, DBUser } from '../dynamo'
import { ConfigType } from '../getConfig'
import { getBookingByIDs } from '../utils'
import { sendEmail } from './sendEmail'

export const sendBookingUpdatedEmails = async (task: EmailBookingUpdatedTask, config: ConfigType) => {
  const eventFromDB = await DBEvent.get({ eventId: task.data.eventId }).go()
  const event = EventSchema.parse(eventFromDB.data)
  const booking = await getBookingByIDs(task.data.eventId, task.data.userId)
  const user = await DB.collections.userWithRoles({ userId: task.data.userId }).go()
  if (user.data.user[0]) {
    await sendEmail(
      {
        template: 'updated',
        recipient: user.data.user[0] as TUser,
        event: event,
        booking: booking,
        bookingOwner: user.data.user[0] as TUser,
      },
      config,
    )
  }
}
