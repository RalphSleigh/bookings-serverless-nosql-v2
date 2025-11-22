import { Grid, Paper, Skeleton, Table, Text, Textarea, TextInput, Title } from '@mantine/core'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { WatchDebounce } from '../../front/src/utils'
import { AttendanceStructureValues } from '../attendance/attendance'
import { PartialBookingType, TBooking } from '../schemas/booking'
import { TEvent, TEventEalingFees, TEventFeesUnion, TEventFreeFees, TEventVCampFees } from '../schemas/event'
import { TFee } from '../schemas/fees'
import { TUser } from '../schemas/user'
import { currency } from '../util'
import { BookingFormDisplayElement, EmailElement, EventListDisplayElement, FeeStructure, FeeStructureCondfigurationElement, GetFeeLineFunction } from './feeStructure'

export class VCampFees implements FeeStructure<TEventVCampFees> {
  typeName: 'vcamp' = 'vcamp'
  name: string = 'VCamp Fees'
  supportedAttendance: AttendanceStructureValues[] = ['freechoice']

  ConfigurationElement: FeeStructureCondfigurationElement<TEventVCampFees> = () => {
    const { register } = useFormContext<{ fee: TEventVCampFees }>()
    const pound = <Text>£</Text>
    return (
      <>
        <Title order={2} size="h5">
          VCamp fee options
        </Title>
        <Grid>
          <Grid.Col span={12}>
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Price" {...register('fee.price', { valueAsNumber: true })} />
          </Grid.Col>
        </Grid>
      </>
    )
  }

  getFeeLines: GetFeeLineFunction<TEventVCampFees> = (event: TEvent<any, any, any, TEventVCampFees>, booking: PartialBookingType) => {
    return [
      {
        label: `VCamp fee (£${event.fee.price} per person)`,
        amount: (event.fee.price || 0) * ((booking.people && booking.people.length) || 0),
      },
    ]
  }

  BookingFormDisplayElementContents: React.FC<{ people: PartialBookingType['people']; event: TEvent<any, any, any, TEventVCampFees>; user: TUser; fees: TFee[] }> = ({ people, event, user, fees }) => {
    const lines = this.getFeeLines(event, { people })

    const outstanding =
      lines.reduce((sum, line) => sum + line.amount, 0) +
      fees.filter((f) => f.type === 'adjustment').reduce((sum, f) => sum + f.amount, 0) -
      fees.filter((f) => f.type === 'payment').reduce((sum, f) => sum + f.amount, 0)

    const paid = fees.filter((f) => f.type === 'payment').reduce((sum, f) => sum + f.amount, 0)

    return (
      <Grid>
        <Grid.Col>
          <Text mt={8}>This is how much it costs</Text>
          <this.FeeTable event={event} booking={{ people }} fees={fees} />
          {outstanding !== 0 && paid !== 0 && (
            <Text fw={700} color={outstanding > 0 ? 'red' : 'green'}>
              {outstanding > 0 ? 'Outstanding balance' : 'Overpaid balance'}: {currency(outstanding)}
            </Text>
          )}
          <Text>
            Please use the reference <b>{this.getPaymentReference({ userId: user.userId } as TBooking<TEvent<any, any, any, TEventVCampFees>>)}</b> when making a bank transfer
          </Text>
        </Grid.Col>
      </Grid>
    )
  }

  BookingFormDisplayElement: BookingFormDisplayElement<TEventVCampFees> = ({ event, user, fees }) => {
    const [people, setPeople] = useState<PartialBookingType['people']>([])
    return (
      <>
        <WatchDebounce value={people} set={setPeople} name="people" duration={500} />
        <this.BookingFormDisplayElementContents event={event} people={people} user={user} fees={fees} />
      </>
    )
  }

  FeeTable: React.FC<{ event: TEvent<any, any, any, TEventVCampFees>; booking: PartialBookingType; fees: TFee[] }> = ({ event, booking, fees }) => {
    const lines = this.getFeeLines(event, booking)

    const adjustmentLines = fees
      .filter((f) => f.type === 'adjustment')
      .map((f) => (
        <Table.Tr key={f.feeId}>
          <Table.Td>
            <Text>{f.note}</Text>
          </Table.Td>
          <Table.Td>
            <Text>{currency(f.amount)}</Text>
          </Table.Td>
          <Table.Td></Table.Td>
        </Table.Tr>
      ))

    const paidLines = fees
      .filter((f) => f.type === 'payment')
      .map((f) => (
        <Table.Tr key={f.feeId}>
          <Table.Td>
            <Text>{f.note}</Text>
          </Table.Td>
          <Table.Td></Table.Td>
          <Table.Td>
            <Text>{currency(f.amount)}</Text>
          </Table.Td>
        </Table.Tr>
      ))

    const rows = lines.map((line, index) => (
      <Table.Tr key={index}>
        <Table.Td>
          <Text>{line.label}</Text>
        </Table.Td>
        <Table.Td>
          <Text>{currency(line.amount)}</Text>
        </Table.Td>
        <Table.Td></Table.Td>
      </Table.Tr>
    ))

    return (
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Td>
              <Text fw={700}>Item</Text>
            </Table.Td>
            <Table.Td>
              <Text fw={700}>Fee</Text>
            </Table.Td>
            <Table.Td>
              <Text fw={700}>Paid</Text>
            </Table.Td>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {[...rows, ...adjustmentLines, ...paidLines]}
          <Table.Tr>
            <Table.Td>
              <Text fw={700}>Total</Text>
            </Table.Td>
            <Table.Td>
              <Text fw={700}>{currency(lines.reduce((sum, line) => sum + line.amount, 0) + fees.filter((f) => f.type === 'adjustment').reduce((sum, f) => sum + f.amount, 0))}</Text>
            </Table.Td>
            <Table.Td>
              <Text fw={700}>{currency(fees.filter((f) => f.type === 'payment').reduce((sum, f) => sum + f.amount, 0))}</Text>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    )
  }

  EventListDisplayElement: EventListDisplayElement<TEventVCampFees> = ({ event, booking, user, fees }) => {
    const lines = this.getFeeLines(event, booking)

    const outstanding =
      lines.reduce((sum, line) => sum + line.amount, 0) +
      fees.filter((f) => f.type === 'adjustment').reduce((sum, f) => sum + f.amount, 0) -
      fees.filter((f) => f.type === 'payment').reduce((sum, f) => sum + f.amount, 0)

    return (
      <Grid>
        <Grid.Col>
          <Text mt={8}>This is how much it costs</Text>
          <this.FeeTable event={event} booking={booking} fees={fees} />
          {outstanding !== 0 && (
            <Text fw={700} color={outstanding > 0 ? 'red' : 'green'}>
              {outstanding > 0 ? 'Outstanding balance' : 'Overpaid balance'}: {currency(outstanding)}
            </Text>
          )}
          <Text>
            Please use the reference <b>{this.getPaymentReference({ userId: user.userId } as TBooking<TEvent<any, any, any, TEventVCampFees>>)}</b> when making a bank transfer
          </Text>
        </Grid.Col>
      </Grid>
    )
  }

  EmailElement: EmailElement<TEventVCampFees> = ({ event, booking }) => {
    return <></>
  }

  getPaymentReference(booking: TBooking<TEvent<any, any, any, TEventVCampFees>>): string {
    return `VC26-${booking.userId.split('-')[4].slice(0, 6).toUpperCase()}`
  }
}
