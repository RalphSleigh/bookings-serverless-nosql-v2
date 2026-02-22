import { EventSchema } from '../../shared/schemas/event'
import { TUser, UserSchema } from '../../shared/schemas/user'
import { EmailBookingUpdatedTask } from '../asyncTasks/asyncTaskQueuer'
import { DB, DBBooking, DBEvent, DBRole, DBUser } from '../dynamo'
import { ConfigType } from '../getConfig'
import { getBookingByIDs } from '../utils'
import { getManagementRoles } from './getManagementRoles'
import { sendEmail } from './sendEmail'

export const sendBookingUpdatedEmails = async (task: EmailBookingUpdatedTask, config: ConfigType) => {
  const eventFromDB = await DBEvent.get({ eventId: task.data.eventId }).go()
  const event = EventSchema.parse(eventFromDB.data)
  const { booking, fees } = await getBookingByIDs(task.data.eventId, task.data.userId)
  const userQuery = await DB.collections.userWithRoles({ userId: task.data.userId }).go()
  const user = UserSchema.parse(userQuery.data.user[0])
  if (user) {
    await sendEmail(
      {
        template: 'updated',
        recipient: user,
        event: event,
        booking: booking,
        bookingOwner: user,
        fees: fees,
      },
      config,
    )

    const roles = await getManagementRoles(event.eventId)

    roles.forEach(async (role) => {
      const userQuery = await DBUser.find({ userId: role.userId }).go()
      const manageUser = UserSchema.parse(userQuery.data[0])
      if (manageUser && !manageUser.preferences.emailNopeList.includes(event.eventId)) {
        await sendEmail(
          {
            template: 'managerBookingUpdated',
            recipient: manageUser,
            event: event,
            booking: booking,
            bookingOwner: user,
            fees: fees,
          },
          config,
        )
      } else {
        console.log(`User ${manageUser.userId} has opted out of emails for event ${event.eventId}`)
      }
    })
  }
}
