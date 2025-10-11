import { Button, Input, Text } from '@mantine/core'
import dayjs, { Dayjs } from 'dayjs'
import AdvancedFormat from 'dayjs/plugin/advancedFormat'
import e from 'express'
import { get } from 'lodash'
import { useController, useFormContext } from 'react-hook-form'

import styles from '../../front/src/css/attendenceButtons.module.css'
import { PersonField } from '../personFields'
import { TBooking } from '../schemas/booking'
import { TEvent, TEventFreeChoiceAttendance } from '../schemas/event'
import { TPerson } from '../schemas/person'
import { AttendanceBookingFormDisplayElement, AttendancePersonCardElement, AttendanceStructure } from './attendanceStructure'

dayjs.extend(AdvancedFormat)

type Nights = { start: Dayjs; end: Dayjs }[]

export class FreeChoiceAttendance implements AttendanceStructure<TEventFreeChoiceAttendance> {
  typeName: 'freechoice' = 'freechoice'
  name = 'Free choice event'
  BookingFormDisplayElement: AttendanceBookingFormDisplayElement<TEventFreeChoiceAttendance> = ({ index, event }) => {
    const { control, watch } = useFormContext<TBooking<TEvent<any, any, TEventFreeChoiceAttendance>>>()

    const {
      field,
      fieldState: { invalid, error },
      formState: { touchedFields, dirtyFields },
    } = useController({
      name: `people.${index}.attendance.bitMask`,
      control,
      rules: { required: true },
    })

    const currentBitMask = field.value || 0
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
        <Input.Label required>Nights attending</Input.Label>
        <Button.Group style={{ flexWrap: 'wrap' }}>{buttons}</Button.Group>
        {invalid && <Input.Error>{error?.message}</Input.Error>}
      </>
    )
  }

  getNightsFromEvent(event: TEvent<any, any, TEventFreeChoiceAttendance, any>): Nights {
    const start = dayjs(event.startDate)
    const end = dayjs(event.endDate)
    const nights: Nights = []

    for (let d = start; d < end; d = d.add(1, 'day')) {
      nights.push({ start: d, end: d.add(1, 'day') })
    }

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
      accessor = (p: TPerson<TEvent<any, any, TEventFreeChoiceAttendance, any>>) => p.attendance?.bitMask || defaultDataFn(event).bitMask
      hideByDefault = true
    }

    class NightsAttending extends PersonField<TEvent<any, any, TEventFreeChoiceAttendance, any>> {
      name = 'Nights Attending'
      accessor = (p: TPerson<TEvent<any, any, TEventFreeChoiceAttendance, any>>) => bitCount32(p.attendance?.bitMask || 0).toString()
      size = 40
    }

    const nights: PersonField<TEvent<any, any, TEventFreeChoiceAttendance, any>>[] = this.getNightsFromEvent(event).map((n, i) => {
      class NightField extends PersonField<TEvent<any, any, TEventFreeChoiceAttendance, any>> {
        name = `${n.start.format('Do MMM')} - ${n.end.format('Do MMM')}`
        accessor = (p: TPerson<TEvent<any, any, TEventFreeChoiceAttendance, any>>) => ((p.attendance?.bitMask || 0) & (1 << i) ? '1' : '0')
        hideByDefault = true
        size = 40
      }
      return new NightField(event)
    })

    return [new Mask(event), new NightsAttending(event), ...nights]
  }

  circles = (bitMask: number, event: TEvent<any, any, TEventFreeChoiceAttendance, any>): string => {
    const nights = this.getNightsFromEvent(event)
    return nights.map((night, nightIndex) => (bitMask & (1 << nightIndex) ? '⬤' : '○')).join(' ')
  }

  PersonCardElement: AttendancePersonCardElement<TEventFreeChoiceAttendance> = ({ person, event }) => {
    return (
      <Text>
        <b>Attendance</b>:  <Text span c="green">{this.circles(person.attendance?.bitMask || 0, event)}</Text>
      </Text>
    )
  }
}

function bitCount32(n: number) {
  n = n - ((n >> 1) & 0x55555555)
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
  return (((n + (n >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24
}
