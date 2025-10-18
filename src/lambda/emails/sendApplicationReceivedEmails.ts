import { EventSchema } from '../../shared/schemas/event'
import { UserSchema } from '../../shared/schemas/user'
import { EmailApplicationReceivedTask, EmailBookingCreatedTask } from '../asyncTasks/asyncTaskQueuer'
import { DB, DBEvent, DBRole, DBUser } from '../dynamo'
import { ConfigType } from '../getConfig'
import { getBookingByIDs } from '../utils'
import { sendEmail } from './sendEmail'

export const sendApplicationReceivedEmails = async (task: EmailApplicationReceivedTask, config: ConfigType) => {
  const eventFromDB = await DBEvent.get({ eventId: task.data.eventId }).go()
  const event = EventSchema.parse(eventFromDB.data)
  const booking = await getBookingByIDs(task.data.eventId, task.data.userId)
  const userQuery = await DB.collections.userWithRoles({ userId: task.data.userId }).go()
  const user = UserSchema.parse(userQuery.data.user[0])
  if (user) {
    await sendEmail(
      {
        template: 'applicationReceived',
        recipient: user,
        event: event,
      },
      config,
    )

    const roles = await DBRole.find({ eventId: event.eventId }).go()

    roles.data?.forEach(async (role) => {
      if (role.role === 'owner') {
        const userQuery = await DBUser.find({ userId: role.userId }).go()
        const manageUser = UserSchema.parse(userQuery.data[0])
        if (manageUser && !manageUser.preferences.emailNopeList.includes(event.eventId)) {
          await sendEmail(
            {
              template: 'managerApplicationReceived',
              recipient: manageUser,
              event: event,
              bookingOwner: user,
            },
            config,
          )
        } else {
          console.log(`User ${manageUser.userId} has opted out of emails for event ${event.eventId}`)
        }
      }
    })
  }
}
