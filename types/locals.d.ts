import { ConfigType } from '../src/lambda/middleware/config'
import { Logger } from '../src/lambda/middleware/logger'
import { getPermissionsFromUser } from '../src/shared/permissions'
import { TBooking } from '../src/shared/schemas/booking'
import { TEvent } from '../src/shared/schemas/event'
import { ContextUser } from '../src/shared/schemas/user'

declare global {
  namespace Express {
    interface Locals {
      config: ConfigType
      user: ContextUser
      permissions: ReturnType<typeof getPermissionsFromUser>
      event: TEvent
      booking: TBooking
      logger: Logger
    }
  }
}
