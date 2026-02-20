import { Button, Divider, Input, Text } from '@mantine/core'
import dayjs, { Dayjs } from 'dayjs'
import AdvancedFormat from 'dayjs/plugin/advancedFormat.js'
import e from 'express'
import { get } from 'lodash'
import { useController, useFormContext, useWatch } from 'react-hook-form'

import styles from '../../front/src/css/attendenceButtons.module.css'
import { TPersonResponse } from '../../lambda/endpoints/event/manage/getEventBookings'
import { PersonField } from '../personFields'
import { TBooking } from '../schemas/booking'
import { TEvent, TEventFreeChoiceAttendance } from '../schemas/event'
import { TPerson } from '../schemas/person'
import { AttendanceBookingFormDisplayElement, AttendanceIsWholeAttendanceFunction, AttendancePersonCardElement, AttendanceStructure } from './attendanceStructure'

dayjs.extend(AdvancedFormat)

type Nights = { start: Dayjs; end: Dayjs }[]

const nightsFromEventCached: { [eventId: string]: Nights } = {}

export class FreeChoiceAttendance implements AttendanceStructure<TEventFreeChoiceAttendance> {
  typeName: 'freechoice' = 'freechoice'
  name = 'Free choice event'
  BookingFormDisplayElement: AttendanceBookingFormDisplayElement<TEventFreeChoiceAttendance> = ({ index, event }) => {
    const { control } = useFormContext<TBooking<TEvent<any, any, TEventFreeChoiceAttendance>>>()
    const value = useWatch({ name: `people.${index}.attendance.bitMask`, control })

    const {
      field,
      fieldState: { invalid, error },
      formState: { touchedFields, dirtyFields },
    } = useController({
      name: `people.${index}.attendance.bitMask`,
      control,
      rules: { required: true },
    })

    const currentBitMask = value || 0
    //console.log(currentBitMask)

    const nights = this.getNightsFromEvent(event)

    const buttons = nights.map((night, nightIndex) => (
      <Button
        size="sm"
        className={styles.root}
        variant={currentBitMask & (1 << nightIndex) ? 'attendanceSelected' : 'attendanceUnselected'}
        key={nightIndex}
        onClick={() => {
          const newBitMask = currentBitMask ^ (1 << nightIndex)
          field.onChange(newBitMask)
          field.onBlur()
        }}
      >
        {night.start.format('ddd Do')} <br />
        {night.end.format('ddd Do')}
      </Button>
    ))
    return (
      <>
        <Divider my="xs" label="Attendance" labelPosition="center" />
        <Input.Label required>Nights attending:</Input.Label>
        <Button.Group style={{ flexWrap: 'wrap' }}>{buttons}</Button.Group>
        {invalid && <Input.Error>{error?.message}</Input.Error>}
      </>
    )
  }

  getNightsFromEvent(event: TEvent<any, any, TEventFreeChoiceAttendance, any>): Nights {
    if (nightsFromEventCached[event.eventId]) return nightsFromEventCached[event.eventId]
    const start = dayjs(event.startDate)
    const end = dayjs(event.endDate)
    const nights: Nights = []

    for (let d = start; d < end; d = d.add(1, 'day')) {
      nights.push({ start: d, end: d.add(1, 'day') })
    }
    nightsFromEventCached[event.eventId] = nights
    return nights
  }

  getDefaultData = (event: TEvent<any, any, TEventFreeChoiceAttendance, any>) => {
    const nights = this.getNightsFromEvent(event)
    return {
      bitMask: nights.reduce((acc, night, index) => {
        return acc | (1 << index)
      }, 0),
    }
  }

  PersonFields = (event: TEvent<any, any, TEventFreeChoiceAttendance, any>) => {
    const defaultDataFn = this.getDefaultData.bind(this)
    class Mask extends PersonField<TEvent<any, any, TEventFreeChoiceAttendance, any>> {
      name = 'Attendance Mask'
      accessor = ({ p, b }: { p: TPersonResponse<TEvent<any, any, TEventFreeChoiceAttendance, any>>; b: TBooking<TEvent<any, any, TEventFreeChoiceAttendance, any>> }) =>
        p.attendance?.bitMask || defaultDataFn(event).bitMask
      hideByDefault = true
    }

    class NightsAttending extends PersonField<TEvent<any, any, TEventFreeChoiceAttendance, any>> {
      name = 'Nights Attending'
      accessor = ({ p, b }: { p: TPersonResponse<TEvent<any, any, TEventFreeChoiceAttendance, any>>; b: TBooking<TEvent<any, any, TEventFreeChoiceAttendance, any>> }) =>
        bitCount32(p.attendance?.bitMask || 0).toString()
      size = 40
    }

    const nights: PersonField<TEvent<any, any, TEventFreeChoiceAttendance, any>>[] = this.getNightsFromEvent(event).map((n, i) => {
      class NightField extends PersonField<TEvent<any, any, TEventFreeChoiceAttendance, any>> {
        name = `${n.start.format('Do MMM')} - ${n.end.format('Do MMM')}`
        accessor = ({ p, b }: { p: TPersonResponse<TEvent<any, any, TEventFreeChoiceAttendance, any>>; b: TBooking<TEvent<any, any, TEventFreeChoiceAttendance, any>> }) =>
          (p.attendance?.bitMask || 0) & (1 << i) ? '1' : '0'
        hideByDefault = true
        size = 40
      }
      return new NightField(event)
    })

    return [new Mask(event), new NightsAttending(event), ...nights]
  }

  isWholeAttendance: AttendanceIsWholeAttendanceFunction<TEventFreeChoiceAttendance> = (event, person): boolean => {
    const nights = this.getNightsFromEvent(event)
    const bitMask = person.attendance?.bitMask || 0
    return nights.every((_, nightIndex) => bitMask & (1 << nightIndex))
  }

  circles = (bitMask: number, event: TEvent<any, any, TEventFreeChoiceAttendance, any>): string => {
    const nights = this.getNightsFromEvent(event)
    return nights.map((night, nightIndex) => (bitMask & (1 << nightIndex) ? '⬤' : '○')).join(' ')
  }

  PersonCardElement: AttendancePersonCardElement<TEventFreeChoiceAttendance> = ({ person, event }) => {
    return (
      <Text>
        <b>Attendance</b>:{' '}
        <Text span c="green">
          {this.circles(person.attendance?.bitMask || 0, event)}
        </Text>
      </Text>
    )
  }
}

export function bitCount32(n: number) {
  n = n - ((n >> 1) & 0x55555555)
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
  return (((n + (n >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24
}
