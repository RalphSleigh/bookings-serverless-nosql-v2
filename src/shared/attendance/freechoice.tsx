import { Button, Input } from '@mantine/core'
import dayjs, { Dayjs } from 'dayjs'
import AdvancedFormat from 'dayjs/plugin/advancedFormat'
import { useController, useFormContext } from 'react-hook-form'

import styles from '../../front/src/css/attendenceButtons.module.css'
import { PersonField } from '../personFields'
import { TBooking } from '../schemas/booking'
import { TEvent, TEventFreeChoiceAttendance } from '../schemas/event'
import { AttendanceBookingFormDisplayElement, AttendanceStructure } from './attendanceStructure'
import e from 'express'
import { TPerson } from '../schemas/person'
import { get } from 'lodash'

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
    class Mask extends PersonField {
      name = 'Attendance Mask'
      accessor = (p: TPerson) => p.attendance?.bitMask || defaultDataFn(event).bitMask
      hideByDefault = true
    }

    class NightsAttending extends PersonField {
      name = 'Nights Attending'
      accessor = (p: TPerson) => bitCount32(p.attendance?.bitMask || 0).toString()
      size = 40
    }

    const nights: PersonField[] = this.getNightsFromEvent(event).map((n, i) => {
        class NightField extends PersonField {
          name = `${n.start.format('Do MMM')} - ${n.end.format('Do MMM')}`
          accessor = (p: TPerson) => (p.attendance?.bitMask || 0) & (1 << i) ? '1' : '0'
          hideByDefault = true
          size = 40
        }
        return new NightField(event)
    })

    return [new Mask(event), new NightsAttending(event), ...nights]
  }
}

function bitCount32 (n: number) {
  n = n - ((n >> 1) & 0x55555555)
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
  return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
}
