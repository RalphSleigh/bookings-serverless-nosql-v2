import { EventSchema } from '../../shared/schemas/event'
import { UserSchema } from '../../shared/schemas/user'
import { EmailManagerDataAccessTask } from '../asyncTasks/asyncTaskQueuer'
import { DB, DBEvent } from '../dynamo'
import { ConfigType } from '../getConfig'
import { sendEmail } from './sendEmail'

export const sendManagerDataAccessEmail = async (task: EmailManagerDataAccessTask, config: ConfigType) => {
  const eventFromDB = await DBEvent.get({ eventId: task.data.eventId }).go()
  const event = EventSchema.parse(eventFromDB.data)
  const userQuery = await DB.collections.userWithRoles({ userId: task.data.userId }).go()
  const user = UserSchema.parse(userQuery.data.user[0])
  if (user) {
    await sendEmail(
      {
        template: 'managerDataAccess',
        recipient: user,
        event: event,
      },
      config,
    )
  }
}
