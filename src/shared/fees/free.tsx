import { Grid, Text, Textarea, TextInput, Title } from '@mantine/core'
import { useFormContext } from 'react-hook-form'
import { PartialDeep } from 'type-fest'

import { AttendanceStructureValues } from '../attendance/attendance'
import { PartialBookingType, TBooking } from '../schemas/booking'
import { TEvent, TEventFeesUnion, TEventFreeFees } from '../schemas/event'
import { BookingFormDisplayElement, EmailElement, EventListDisplayElement, FeeStructure, FeeStructureCondfigurationElement, GetFeeLineFunction } from './feeStructure'

export class FreeFees implements FeeStructure<TEventFreeFees> {
  typeName: 'free' = 'free'
  name: string = 'Free Fees'
  supportedAttendance: AttendanceStructureValues[] = []

  ConfigurationElement: FeeStructureCondfigurationElement<TEventFreeFees> = () => {
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

  getPaymentReference(booking: TBooking<TEvent<any, any, any, TEventFreeFees>>): string {
    return ''
  }
}
