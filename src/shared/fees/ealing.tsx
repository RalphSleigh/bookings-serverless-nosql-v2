import { Grid, Table, Text, Textarea, TextInput, Title } from '@mantine/core'
import { Markdown as EmailMarkdown } from '@react-email/markdown'
import dayjs from 'dayjs'
import { useFormContext, useWatch } from 'react-hook-form'

import { AttendanceTypes } from '../attendance/attendance'
import { PartialBookingType } from '../schemas/booking'
import { TEalingFees, TEvent, TEventWithFees, TFees } from '../schemas/event'
import { TPerson } from '../schemas/person'
import { BookingFormDisplayElement, EmailElement, EventListDisplayElement, FeeLine, FeeStructure, FeeStructureCondfigurationElement, FeeStructureConfigData, GetFeeLineFunction } from './feeStructure'

type EventWithEalingFees = TEvent & { fees: TEalingFees }

export class EalingFees implements FeeStructure<TEalingFees> {
  typeName: 'ealing' = 'ealing'
  name = 'Ealing Fees'
  supportedAttendance: AttendanceTypes[] = ['whole']
  ConfigurationElement: FeeStructureCondfigurationElement<TEalingFees> = () => {
    const { register } = useFormContext<{ fee: TEalingFees }>()
    //const { updateNumber, updateField } = getMemoObjectUpdateFunctions(getSubUpdate(update, 'ealingData'))
    const pound = <Text>£</Text>
    return (
      <>
        <Title order={2} size="h5">
          Ealing fee options
        </Title>
        <Grid>
          <Grid.Col span={6}>
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Unaccompanied" {...register('fee.ealingData.unaccompanied', { valueAsNumber: true })} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Unaccompanied Discount" {...register('fee.ealingData.unaccompaniedDiscount', { valueAsNumber: true })} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Accompanied" {...register('fee.ealingData.accompanied', { valueAsNumber: true })} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Accompanied Discount" {...register('fee.ealingData.accompaniedDiscount', { valueAsNumber: true })} />
          </Grid.Col>
        </Grid>
        <Textarea autosize={true} label="Payment instructions" {...register('fee.ealingData.paymentInstructions')} />
      </>
    )
  }

  getFeeLines: GetFeeLineFunction<TEalingFees> = (event: TEventWithFees<TEalingFees>, booking: PartialBookingType) => {
    const people = booking.people || []
    const accompanied = people.find((p) => p && p.basic && p.basic.dob && dayjs(p.basic.dob).isBefore(dayjs(event.endDate).subtract(18, 'years')))
    const amount = (accompanied ? event.fee.ealingData.accompanied : event.fee.ealingData.unaccompanied) * people.length

    return [
      {
        label: `${people.length} ${people.length == 1 ? 'Person' : 'People'} (${accompanied ? 'accompanied' : 'unaccompanied'})`,
        amount,
      },
    ]
  }

  getFeeLinesDiscounted: GetFeeLineFunction<TEalingFees> = (event: TEventWithFees<TEalingFees>, booking: PartialBookingType) => {
    const people = booking.people || []
    const accompanied = people.find((p) => p && p.basic && p.basic.dob && dayjs(p.basic.dob).isBefore(dayjs(event.endDate).subtract(18, 'years')))
    const amount = (accompanied ? event.fee.ealingData.accompaniedDiscount : event.fee.ealingData.unaccompaniedDiscount) * people.length

    return [
      {
        label: `${people.length} ${people.length == 1 ? 'Person' : 'People'} (${accompanied ? 'accompanied' : 'unaccompanied'})`,
        amount,
      },
    ]
  }

  BookingFormDisplayElement: BookingFormDisplayElement<TEalingFees> = ({ event }) => {
    const people = useWatch<PartialBookingType>({ name: 'people', compute: (people) => people || [] }) as TPerson[]
    //const people = watch('people') || []
    //const people = []

    const lines = this.getFeeLines(event, { people })
    const discountedLines = this.getFeeLinesDiscounted(event, { people })

    return (
      <>
        <Text mt={8}>
          The discounted donation is offered to all families/individuals where there is no wage earner and/or the family/individual is on a low wage. This would include DFs and students as well as
          adults and families. Cost should never be a reason for people being unable to attend camp so please contact us if you need further discount.
        </Text>
        <Table m={16}>
          <Table.Thead>
            <Table.Tr>
              <Table.Td></Table.Td>
              <Table.Td>
                <Text fw={700}>Standard</Text>
              </Table.Td>
              <Table.Td>
                <Text fw={700}>Discounted</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>
                <Text>Unaccompanied Elfins, Pioneers & Venturers</Text>
              </Table.Td>
              <Table.Td>{currency(event.fee.ealingData.unaccompanied)}</Table.Td>
              <Table.Td>{currency(event.fee.ealingData.unaccompaniedDiscount)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>
                <Text>Elfins, Pioneers & Venturers accompanied by a responsible adult, DFs and Adults</Text>
              </Table.Td>
              <Table.Td>{currency(event.fee.ealingData.accompanied)}</Table.Td>
              <Table.Td>{currency(event.fee.ealingData.accompaniedDiscount)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text fw={700} ta="center">
                  My Booking
                </Text>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>
                <Text>{lines[0].label}</Text>
              </Table.Td>
              <Table.Td>{currency(lines[0].amount)}</Table.Td>
              <Table.Td>{currency(discountedLines[0].amount)}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </>
    )
  }

  EventListDisplayElement: EventListDisplayElement<TEalingFees> = ({ event, booking }) => {
    const lines = this.getFeeLines(event, booking)
    const discountedLines = this.getFeeLinesDiscounted(event, booking)
    return (
      <>
        <Text mt={8}>
          The discounted donation is offered to all families/individuals where there is no wage earner and/or the family/individual is on a low wage. This would include DFs and students as well as
          adults and families. Cost should never be a reason for people being unable to attend camp so please contact us if you need further discount.
        </Text>
        <Table withColumnBorders withTableBorder mt={8}>
          <Table.Thead>
            <Table.Tr>
              <Table.Td>
                <Text fw={700}>Descripion</Text>
              </Table.Td>
              <Table.Td>
                <Text fw={700}>Standard</Text>
              </Table.Td>
              <Table.Td>
                <Text fw={700}>Discounted</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>
                <Text>Unaccompanied Elfins, Pioneers & Venturers</Text>
              </Table.Td>
              <Table.Td>{currency(event.fee.ealingData.unaccompanied)}</Table.Td>
              <Table.Td>{currency(event.fee.ealingData.unaccompaniedDiscount)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>
                <Text>Elfins, Pioneers & Venturers accompanied by a responsible adult, DFs and Adults</Text>
              </Table.Td>
              <Table.Td>{currency(event.fee.ealingData.accompanied)}</Table.Td>
              <Table.Td>{currency(event.fee.ealingData.accompaniedDiscount)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text fw={700} ta="center">
                  My Booking
                </Text>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>
                <Text>{lines[0].label}</Text>
              </Table.Td>
              <Table.Td>{currency(lines[0].amount)}</Table.Td>
              <Table.Td>{currency(discountedLines[0].amount)}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </>
    )
  }

  EmailElement: EmailElement<TEalingFees> = ({ event, booking }) => {
    const lines = this.getFeeLines(event, booking)
    const discountedLines = this.getFeeLinesDiscounted(event, booking)

    return (
      <>
        <EmailMarkdown
          children={event.fee.ealingData.paymentInstructions}
          markdownCustomStyles={{
            p: { fontSize: '14px' },
          }}
        />
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Standard</th>
              <th>Discounted</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>My Booking: {lines[0].label}</td>
              <td>{currency(lines[0].amount)}</td>
              <td>{currency(discountedLines[0].amount)}</td>
            </tr>
          </tbody>
        </table>
      </>
    )
  }
}

const currency = (c: number) => c.toLocaleString(undefined, { style: 'currency', currency: 'GBP' })
