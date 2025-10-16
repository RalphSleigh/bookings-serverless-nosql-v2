import { Grid, Paper, Skeleton, Text, Textarea, TextInput, Title } from '@mantine/core'
import { useFormContext } from 'react-hook-form'
import { PartialDeep } from 'type-fest'

import { AttendanceStructureValues } from '../attendance/attendance'
import { PartialBookingType } from '../schemas/booking'
import { TEvent, TEventFeesUnion, TEventFreeFees, TEventVCampFees } from '../schemas/event'
import { BookingFormDisplayElement, EmailElement, EventListDisplayElement, FeeStructure, FeeStructureCondfigurationElement, GetFeeLineFunction } from './feeStructure'

export class VCampFees implements FeeStructure<TEventVCampFees> {
  typeName: 'vcamp' = 'vcamp'
  name: string = 'VCamp Fees'
  supportedAttendance: AttendanceStructureValues[] = ['freechoice']

  ConfigurationElement: FeeStructureCondfigurationElement<TEventVCampFees> = () => {
    return (
      <div>
        <p>VCamp</p>
      </div>
    )
  }

  getFeeLines: GetFeeLineFunction<TEventVCampFees> = (event: TEvent<any, any, any, TEventVCampFees>, booking: PartialBookingType) => {
    return [
      {
        label: `Free`,
        amount: 0,
      },
    ]
  }

  BookingFormDisplayElement: BookingFormDisplayElement<TEventVCampFees> = ({ event }) => {
    const { watch } = useFormContext<PartialBookingType>()
    const people = watch('people') || []

    const lines = this.getFeeLines(event, { people })

    return (
      <>
        <Paper shadow="xs" radius="xl" withBorder p="xl" mt={16}>
          <Title order={4}>
            TODO: Information about the fees will go here
          </Title>
        </Paper>
      </>
    )
  }

  EventListDisplayElement: EventListDisplayElement<TEventVCampFees> = ({ event, booking, fees }) => {
    return (
      <>
        <Paper shadow="xs" radius="xl" withBorder p="xl" mt={16}>
          <Title order={4}>
            TODO: Information about the fees will go here
          </Title>
        </Paper>
      </>
    )
  }

  EmailElement: EmailElement<TEventVCampFees> = ({ event, booking }) => {
    return <></>
  }
}
