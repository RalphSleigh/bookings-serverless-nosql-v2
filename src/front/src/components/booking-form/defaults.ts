import { get } from 'lodash'
import { DefaultValues } from 'react-hook-form'
import { v7 as uuidv7 } from 'uuid'

import { getAttendanceType } from '../../../../shared/attendance/attendance'
import { TBooking } from '../../../../shared/schemas/booking'
import { TEvent } from '../../../../shared/schemas/event'
import { TPerson } from '../../../../shared/schemas/person'
import { TUser } from '../../../../shared/schemas/user'

export const defaultPersonData = (user: TUser, event: TEvent): DefaultValues<TPerson<TEvent>> => {
  const attendanceStructure = getAttendanceType(event)

  return { eventId: event.eventId, userId: user.userId, cancelled: false, attendance: attendanceStructure.getDefaultData(event) }
}

export const defaultBookingData = (user: TUser, event: TEvent): DefaultValues<TBooking> & { userId: string; eventId: string } => {
  return { userId: user.userId, eventId: event.eventId, cancelled: false, basic: {}, people: [defaultPersonData(user, event)] }
}
