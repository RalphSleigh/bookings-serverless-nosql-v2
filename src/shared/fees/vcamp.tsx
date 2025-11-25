import { Button, Grid, Group, Paper, Skeleton, Table, Text, Textarea, TextInput, Title } from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { envQueryOptions } from '../../front/src/queries/env'
import { WatchDebounce } from '../../front/src/utils'
import { AttendanceStructureValues, getAttendanceType } from '../attendance/attendance'
import { bitCount32, FreeChoiceAttendance } from '../attendance/freechoice'
import { PartialBookingType, TBooking } from '../schemas/booking'
import { TEvent, TEventEalingFees, TEventFeesUnion, TEventFreeFees, TEventVCampFees } from '../schemas/event'
import { TFee } from '../schemas/fees'
import { TUser } from '../schemas/user'
import { currency } from '../util'
import { BookingFormDisplayElement, EmailElement, EventListDisplayElement, FeeLine, FeeStructure, FeeStructureCondfigurationElement, GetFeeLineFunction } from './feeStructure'

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
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Participant A" {...register('fee.participant.a', { valueAsNumber: true })} />
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Participant B" {...register('fee.participant.b', { valueAsNumber: true })} />
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Volunteer A" {...register('fee.volunteer.a', { valueAsNumber: true })} />
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Volunteer B" {...register('fee.volunteer.b', { valueAsNumber: true })} />
          </Grid.Col>
        </Grid>
      </>
    )
  }

  getFeeLines: GetFeeLineFunction<TEventVCampFees> = (event: TEvent<any, any, any, TEventVCampFees>, booking: PartialBookingType) => {
    const attendance = getAttendanceType(event) as FreeChoiceAttendance
    const nights = attendance.getNightsFromEvent(event)
    const peopleTotals = nights.map(() => ({ participant: 0, volunteer: 0 }))

    booking.people?.forEach((p) => {
      if (!p || !p.attendance?.bitMask || !p.basic?.role) return
      const nights = bitCount32(p.attendance.bitMask || 0)
      peopleTotals[nights - 1][p?.basic?.role] += 1
    })

    const lines = peopleTotals.reduce((lines: FeeLine[], tp, index) => {
      if(tp.participant > 0) {
        lines.push({
          label: `${tp.participant} ${tp.participant > 1 ? 'participants' : 'participant'} for ${index + 1} ${index + 1 === 1 ? 'night' : 'nights'} at ${currency(event.fee.participant.a + event.fee.participant.b * (index + 1))} ${tp.participant > 1 ? 'each' : ''}`,
          amount: (event.fee.participant.a + event.fee.participant.b * (index + 1)) * tp.participant,
        })
      }
      if(tp.volunteer > 0) {
        lines.push({
          label: `${tp.volunteer} ${tp.volunteer > 1 ? 'volunteers' : 'volunteer'} for ${index + 1} ${index + 1 === 1 ? 'night' : 'nights'} at ${currency(event.fee.volunteer.a + event.fee.volunteer.b * (index + 1))} ${tp.volunteer > 1 ? 'each' : ''}`,
          amount: (event.fee.volunteer.a + event.fee.volunteer.b * (index + 1)) * tp.volunteer,
        })
      }
      return lines
    },[])

    return lines
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
          <Text mt={8}><b>Camp fees:</b></Text>
          <Text mt={4}>Participants: {currency(event.fee.participant.a)} + {currency(event.fee.participant.b)} per night</Text>
          <Text mt={4}>Volunteers: {currency(event.fee.volunteer.a)} + {currency(event.fee.volunteer.b)} per night</Text>
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
            <Table.Th>
              <Text fw={700}>Item</Text>
            </Table.Th>
            <Table.Th>
              <Text fw={700}>Fee</Text>
            </Table.Th>
            <Table.Th>
              <Text fw={700}>Paid</Text>
            </Table.Th>
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
          <this.StripeElement event={event} booking={booking as TBooking<TEvent<any, any, any, TEventVCampFees>>} fees={fees} />
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

  StripeElement: React.FC<{ event: TEvent<any, any, any, TEventVCampFees>; booking: TBooking<TEvent<any, any, any, TEventVCampFees>>; fees: TFee[] }> = ({ event, booking, fees }) => {
    if (booking.people.length > 3) return null
    const outstanding =
      this.getFeeLines(event, booking).reduce((sum, line) => sum + line.amount, 0) +
      fees.filter((f) => f.type === 'adjustment').reduce((sum, f) => sum + f.amount, 0) -
      fees.filter((f) => f.type === 'payment').reduce((sum, f) => sum + f.amount, 0)

    if (outstanding <= 0) return null

    return (
      <Group>
        <Text style={{ flex: 1 }}>As you are booking three or fewer people you can pay by card now:</Text>
        <Button variant="gradient" gradient={{ from: 'cyan', to: 'green', deg: 110 }} onClick={() => (window.location.href = `/api/event/${event.eventId}/booking/redirectToStripe`)}>
          Pay by card
        </Button>
      </Group>
    )
  }
}
