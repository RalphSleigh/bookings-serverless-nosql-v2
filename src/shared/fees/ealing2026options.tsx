import { Grid, Table, Text, Textarea, TextInput, Title } from '@mantine/core'
import { Markdown as EmailMarkdown } from '@react-email/markdown'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { WatchDebounce } from '../../front/src/utils'
import type { TBookingResponse } from '../../lambda/endpoints/event/manage/getEventBookings'
import { AttendanceStructureValues } from '../attendance/attendance'
import { PartialBookingType } from '../schemas/booking'
import { TEvent, TEventEalingFees2026Options, TEventOptionsAttendance } from '../schemas/event'
import { TFee } from '../schemas/fees'
import { currency } from '../util'
import { BookingFormDisplayElement, EmailElement, EventListDisplayElement, FeeLine, FeeStructure, FeeStructureConfigurationElement, GetFeeLineFunction } from './feeStructure'

export class Ealing2026OptionsFees implements FeeStructure<TEventEalingFees2026Options> {
  typeName: 'ealing2026options' = 'ealing2026options'
  name = 'Ealing Fees 2026 Options'
  supportedAttendance: AttendanceStructureValues[] = ['options']
  ConfigurationElement: FeeStructureConfigurationElement<TEventEalingFees2026Options> = ({}) => {
    const { register, setValue, watch } = useFormContext<{ fee: TEventEalingFees2026Options; attendance: TEventOptionsAttendance }>()
    //const { updateNumber, updateField } = getMemoObjectUpdateFunctions(getSubUpdate(update, 'ealingData'))
    const pound = <Text>£</Text>

    const event = watch()

    /*     useEffect(() => {
      const options =  event.attendance.attendanceOptions.map((k, i) => {
        const existing = event.fee.ealingData2026options.options[i]
        return existing || { child: 0, childDiscount: 0, adult: 0, adultDiscount: 0 }
      })
      setValue('fee.ealingData2026options.options', options)
    }, [event.attendance.attendanceOptions]) */

    const options = (event as TEvent<any, any, TEventOptionsAttendance, TEventEalingFees2026Options>).attendance.attendanceOptions.map((k, i) => {
      return (
        <Grid key={i}>
          <Grid.Col span={12}>
            <Text>
              <b>{k.option}</b>
            </Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Child" {...register(`fee.ealingData2026options.options.${i}.child`, { valueAsNumber: true })} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Child Discount" {...register(`fee.ealingData2026options.options.${i}.childDiscount`, { valueAsNumber: true })} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Adult" {...register(`fee.ealingData2026options.options.${i}.adult`, { valueAsNumber: true })} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Adult Discount" {...register(`fee.ealingData2026options.options.${i}.adultDiscount`, { valueAsNumber: true })} />
          </Grid.Col>
        </Grid>
      )
    })

    return (
      <>
        <Title order={2} size="h5">
          Ealing fee options
        </Title>
        {options}
        <Textarea autosize={true} label="Payment instructions" {...register('fee.ealingData2026options.paymentInstructions')} />
      </>
    )
  }

  getFeeLines: GetFeeLineFunction<TEventEalingFees2026Options> = (event: TEvent<any, any, TEventOptionsAttendance, TEventEalingFees2026Options>, booking: PartialBookingType) => {
    const people = booking.people || []
    const under4 = people.filter((p) => p && p.basic && p.basic.dob && dayjs(p.basic.dob).isAfter(dayjs(event.endDate).subtract(4, 'years'))).length

    const lines: FeeLine[] = []

    if (under4) {
      lines.push({
        label: `${under4} ${under4 == 1 ? 'Child under 4' : 'Children under 4'}`,
        amount: 0,
      })
    }

    event.attendance.attendanceOptions.forEach((option, i) => {
      const child = people.filter(
        (p) =>
          p &&
          p.basic &&
          p.basic.dob &&
          p.attendance &&
          'option' in p.attendance &&
          p.attendance.option === option.option &&
          dayjs(p.basic.dob).isBefore(dayjs(event.endDate).subtract(4, 'years')) &&
          dayjs(p.basic.dob).isAfter(dayjs(event.endDate).subtract(16, 'years')),
      ).length
      const adult = people.filter(
        (p) =>
          p && p.basic && p.basic.dob && p.attendance && 'option' in p.attendance && p.attendance.option === option.option && dayjs(p.basic.dob).isBefore(dayjs(event.endDate).subtract(16, 'years')),
      ).length

      const childAmount = event.fee.ealingData2026options.options[i].child
      const adultAmount = event.fee.ealingData2026options.options[i].adult

      if (child) {
        lines.push({
          label: `${child} ${child == 1 ? 'Child for ' + option.option : 'Children for ' + option.option}`,
          amount: child * childAmount,
        })
      }

      if (adult) {
        lines.push({
          label: `${adult} ${adult == 1 ? 'Adult for ' + option.option : 'Adults for ' + option.option}`,
          amount: adult * adultAmount,
        })
      }
    })

    return lines
  }

  getFeeLinesDiscounted: GetFeeLineFunction<TEventEalingFees2026Options> = (event: TEvent<any, any, TEventOptionsAttendance, TEventEalingFees2026Options>, booking: PartialBookingType) => {
    const people = booking.people || []
    const under4 = people.filter((p) => p && p.basic && p.basic.dob && dayjs(p.basic.dob).isAfter(dayjs(event.endDate).subtract(4, 'years'))).length

    const lines: FeeLine[] = []

    if (under4) {
      lines.push({
        label: `${under4} ${under4 == 1 ? 'Child under 4' : 'Children under 4'}`,
        amount: 0,
      })
    }

    event.attendance.attendanceOptions.forEach((option, i) => {
      const child = people.filter(
        (p) =>
          p &&
          p.basic &&
          p.basic.dob &&
          p.attendance &&
          'option' in p.attendance &&
          p.attendance.option === option.option &&
          dayjs(p.basic.dob).isBefore(dayjs(event.endDate).subtract(4, 'years')) &&
          dayjs(p.basic.dob).isAfter(dayjs(event.endDate).subtract(16, 'years')),
      ).length
      const adult = people.filter(
        (p) =>
          p && p.basic && p.basic.dob && p.attendance && 'option' in p.attendance && p.attendance.option === option.option && dayjs(p.basic.dob).isBefore(dayjs(event.endDate).subtract(16, 'years')),
      ).length

      const childAmount = event.fee.ealingData2026options.options[i].childDiscount
      const adultAmount = event.fee.ealingData2026options.options[i].adultDiscount

      if (child) {
        lines.push({
          label: `${child} ${child == 1 ? 'Child for ' + option.option : 'Children for ' + option.option} (discounted)`,
          amount: child * childAmount,
        })
      }

      if (adult) {
        lines.push({
          label: `${adult} ${adult == 1 ? 'Adult for ' + option.option : 'Adults for ' + option.option} (discounted)`,
          amount: adult * adultAmount,
        })
      }
    })

    return lines
  }

  BookingFormDisplayElementContents: React.FC<{ people: PartialBookingType['people']; event: TEvent<any, any, TEventOptionsAttendance, TEventEalingFees2026Options>; fees: TFee[] }> = ({
    people,
    event,
    fees,
  }) => {
    const lines = this.getFeeLines(event, { people })
    const discountedLines = this.getFeeLinesDiscounted(event, { people })

    let total = 0
    let discountedTotal = 0

    const mylines = lines.map((line, index) => {
      total += line.amount
      discountedTotal += discountedLines[index].amount

      return (
        <Table.Tr key={index}>
          <Table.Td>{line.label}</Table.Td>
          <Table.Td>{currency(line.amount)}</Table.Td>
          <Table.Td>{currency(discountedLines[index].amount)}</Table.Td>
        </Table.Tr>
      )
    })

    const adjustmentLines = fees
      .filter((f) => f.type === 'adjustment')
      .map((f) => {
        total += f.amount
        discountedTotal += f.amount

        return (
          <Table.Tr key={f.feeId}>
            <Table.Td>{f.note}</Table.Td>
            <Table.Td>{currency(f.amount)}</Table.Td>
            <Table.Td>{currency(f.amount)}</Table.Td>
          </Table.Tr>
        )
      })

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
            {event.attendance.attendanceOptions.map((o, i) => {
              return (
                <>
                  <Table.Tr key={i}>
                    <Table.Td>
                      <Text>Children {o.option}</Text>
                    </Table.Td>
                    <Table.Td>{currency(event.fee.ealingData2026options.options[i].child)}</Table.Td>
                    <Table.Td>{currency(event.fee.ealingData2026options.options[i].childDiscount)}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text>DFs and Adults {o.option}</Text>
                    </Table.Td>
                    <Table.Td>{currency(event.fee.ealingData2026options.options[i].adult)}</Table.Td>
                    <Table.Td>{currency(event.fee.ealingData2026options.options[i].adultDiscount)}</Table.Td>
                  </Table.Tr>
                </>
              )
            })}
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text fw={700} ta="center">
                  My Booking
                </Text>
              </Table.Td>
            </Table.Tr>
            {mylines}
            {adjustmentLines}
            <Table.Tr>
              <Table.Td>
                <Text fw={700}>Total</Text>
              </Table.Td>
              <Table.Td>
                <Text fw={700}>{currency(total)}</Text>
              </Table.Td>
              <Table.Td>
                <Text fw={700}>{currency(discountedTotal)}</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </>
    )
  }

  BookingFormDisplayElement: BookingFormDisplayElement<TEventEalingFees2026Options> = ({ event, fees }) => {
    const [people, setPeople] = useState<PartialBookingType['people']>([])
    return (
      <>
        <WatchDebounce value={people} set={setPeople} name="people" duration={500} />
        <this.BookingFormDisplayElementContents event={event} people={people} fees={fees} />
      </>
    )
  }

  EventListDisplayElement: EventListDisplayElement<TEventEalingFees2026Options> = ({ event, booking, fees }) => {
    const lines = this.getFeeLines(event, booking)
    const discountedLines = this.getFeeLinesDiscounted(event, booking)

    let total = 0
    let discountedTotal = 0

    const mylines = lines.map((line, index) => {
      total += line.amount
      discountedTotal += discountedLines[index].amount

      return (
        <Table.Tr key={index}>
          <Table.Td>{line.label}</Table.Td>
          <Table.Td>{currency(line.amount)}</Table.Td>
          <Table.Td>{currency(discountedLines[index].amount)}</Table.Td>
        </Table.Tr>
      )
    })

    const adjustmentLines = fees
      .filter((f) => f.type === 'adjustment')
      .map((f) => {
        total += f.amount
        discountedTotal += f.amount

        return (
          <Table.Tr key={f.feeId}>
            <Table.Td>{f.note}</Table.Td>
            <Table.Td>{currency(f.amount)}</Table.Td>
            <Table.Td>{currency(f.amount)}</Table.Td>
          </Table.Tr>
        )
      })

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
                <Text fw={700}>Description</Text>
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
            {(event as TEvent<any, any, TEventOptionsAttendance, TEventEalingFees2026Options>).attendance.attendanceOptions.map((o, i) => {
              return (
                <>
                  <Table.Tr key={i}>
                    <Table.Td>
                      <Text>Children {o.option}</Text>
                    </Table.Td>
                    <Table.Td>{currency(event.fee.ealingData2026options.options[i].child)}</Table.Td>
                    <Table.Td>{currency(event.fee.ealingData2026options.options[i].childDiscount)}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text>DFs and Adults {o.option}</Text>
                    </Table.Td>
                    <Table.Td>{currency(event.fee.ealingData2026options.options[i].adult)}</Table.Td>
                    <Table.Td>{currency(event.fee.ealingData2026options.options[i].adultDiscount)}</Table.Td>
                  </Table.Tr>
                </>
              )
            })}
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text fw={700} ta="center">
                  My Booking
                </Text>
              </Table.Td>
            </Table.Tr>
            {mylines}
            {adjustmentLines}
            <Table.Tr>
              <Table.Td>
                <Text fw={700}>Total</Text>
              </Table.Td>
              <Table.Td>
                <Text fw={700}>{currency(total)}</Text>
              </Table.Td>
              <Table.Td>
                <Text fw={700}>{currency(discountedTotal)}</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </>
    )
  }

  EmailElement: EmailElement<TEventEalingFees2026Options> = ({ event, booking, fees }) => {
    const lines = this.getFeeLines(event, booking)
    const discountedLines = this.getFeeLinesDiscounted(event, booking)

    let total = 0
    let discountedTotal = 0

    const mylines = lines.map((line, index) => {
      total += line.amount
      discountedTotal += discountedLines[index].amount

      return (
        <tr key={index}>
          <td>{line.label}</td>
          <td>{currency(line.amount)}</td>
          <td>{currency(discountedLines[index].amount)}</td>
        </tr>
      )
    })

    const adjustmentLines = fees
      .filter((f) => f.type === 'adjustment')
      .map((f) => {
        total += f.amount
        discountedTotal += f.amount
        return (
          <tr key={f.feeId}>
            <td>{f.note}</td>
            <td>{currency(f.amount)}</td>
            <td>{currency(f.amount)}</td>
          </tr>
        )
      })

    return (
      <>
        <EmailMarkdown
          children={event.fee.ealingData2026options.paymentInstructions}
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
            {mylines}
            {adjustmentLines}
            <tr>
              <td>
                <b>Total</b>
              </td>
              <td>
                <b>{currency(total)}</b>
              </td>
              <td>
                <b>{currency(discountedTotal)}</b>
              </td>
            </tr>
          </tbody>
        </table>
      </>
    )
  }

  getPaymentReference(booking: TBookingResponse<TEvent<any, any, TEventOptionsAttendance, TEventEalingFees2026Options>>): string {
    return `EALING${booking.userId.split('-')[0].toUpperCase()}`
  }
}
