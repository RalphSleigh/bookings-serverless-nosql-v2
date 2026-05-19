import { Text } from '@mantine/core'
import { useFormContext } from 'react-hook-form'

import type { TBookingResponse } from '../../lambda/endpoints/event/manage/getEventBookings'
import { AttendanceStructureValues } from '../attendance/attendance'
import { PartialBookingType } from '../schemas/booking'
import { TEvent, TEventFreeFees } from '../schemas/event'
import { BookingFormDisplayElement, EmailElement, EventListDisplayElement, FeeStructure, FeeStructureConfigurationElement, GetFeeLineFunction } from './feeStructure'

export class FreeFees implements FeeStructure<TEventFreeFees> {
  typeName: 'free' = 'free'
  name: string = 'Free Fees'
  supportedAttendance: AttendanceStructureValues[] = []

  ConfigurationElement: FeeStructureConfigurationElement<TEventFreeFees> = () => {
    return (
      <div>
        <p>Free</p>
      </div>
    )
  }

  getFeeLines: GetFeeLineFunction<TEventFreeFees> = (event: TEvent<any, any, any, TEventFreeFees>, booking: PartialBookingType) => {
    return [
      {
        label: `Free`,
        amount: 0,
      },
    ]
  }

  BookingFormDisplayElement: BookingFormDisplayElement<TEventFreeFees> = ({ event }) => {
    const { watch } = useFormContext<PartialBookingType>()
    const people = watch('people') || []

    const lines = this.getFeeLines(event, { people })

    return (
      <>
        {lines.map((line) => (
          <Text key={line.label}>
            {line.label}: {line.amount}
          </Text>
        ))}
      </>
    )
  }

  EventListDisplayElement: EventListDisplayElement<TEventFreeFees> = ({ event, booking, fees }) => {
    return <></>
  }

  EmailElement: EmailElement<TEventFreeFees> = ({ event, booking }) => {
    return <></>
  }

  getPaymentReference(booking: TBookingResponse<TEvent<any, any, any, TEventFreeFees>>): string {
    return ''
  }
}
