import { ActionIcon, Group, Input, Radio, Table, Text, TextInput } from '@mantine/core'
import { IconPlus, IconX } from '@tabler/icons-react'
import { useContext } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import z from 'zod/v4'

import { ReadOnlyContext } from '../../front/src/components/booking-form/readOnlyContext'
import { CustomRadioGroup } from '../../front/src/components/custom-inputs/customRadioGroup'
import { TPersonResponse } from '../../lambda/endpoints/event/manage/getEventBookings'
import { PersonField } from '../personFields'
import { TBooking } from '../schemas/booking'
import { EventSchemaWhenCreating, TEvent, TEventOptionsAttendance } from '../schemas/event'
import { AttendanceBookingFormDisplayElement, AttendanceEventFormElement, AttendanceIsWholeAttendanceFunction, AttendancePersonCardElement, AttendanceStructure } from './attendanceStructure'

export class OptionsAttendance implements AttendanceStructure<TEventOptionsAttendance> {
  typeName: 'options' = 'options'
  name = 'Options event'
  BookingFormDisplayElement: AttendanceBookingFormDisplayElement<TEventOptionsAttendance> = ({ index, event }) => {
    const readOnly = useContext(ReadOnlyContext)
    return (
      <CustomRadioGroup<TBooking<TEvent>> mt={16} name={`people.${index}.attendance.option`} required>
        <Input.Label required>
          <b>Attendance Option:</b>
        </Input.Label>
        <Group mt={8}>
          {event.attendance.attendanceOptions.map((option) => (
            <Radio key={option.option} value={option.option} disabled={readOnly} label={option.option} />
          ))}
        </Group>
      </CustomRadioGroup>
    )
  }

  EventFormElement: AttendanceEventFormElement<TEventOptionsAttendance> = ({}) => {
    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray<TEvent<any, any, TEventOptionsAttendance, any>>({
      name: 'attendance.attendanceOptions', // unique name for your Field Array
    })

    const { register, control, formState } = useFormContext<z.infer<typeof EventSchemaWhenCreating>>()

    const options = fields.map((f, index) => {
      return (
        <Table.Tr key={f.id}>
          <Table.Td>
            <TextInput {...register(`attendance.attendanceOptions.${index}.option` as const)} />
          </Table.Td>
          <Table.Td>
            <ActionIcon gradient={{ from: 'red', to: 'pink', deg: 110 }} variant="gradient" size="input-sm" onClick={() => remove(index)}>
              <IconX />
            </ActionIcon>
          </Table.Td>
        </Table.Tr>
      )
    })

    return (
      <>
        <Text>
          <b>Options</b>
        </Text>
        <Table p={4} striped withTableBorder m={4}>
          <Table.Tbody>{options}</Table.Tbody>
        </Table>
        <ActionIcon m={4} gradient={{ from: 'teal', to: 'lime', deg: 110 }} variant="gradient" onClick={() => append({ option: '' })}>
          <IconPlus />
        </ActionIcon>
      </>
    )
  }

  PersonFields = (event: TEvent<any, any, TEventOptionsAttendance, any>) => {
    class Option extends PersonField<TEvent<any, any, TEventOptionsAttendance, any>> {
      name = 'Option'
      accessor = ({ p, b }: { p: TPersonResponse<TEvent<any, any, TEventOptionsAttendance, any>>; b: TBooking<TEvent<any, any, TEventOptionsAttendance, any>> }) => p.attendance?.option || ''
    }

    return [new Option(event)]
  }

  isWholeAttendance: AttendanceIsWholeAttendanceFunction<TEventOptionsAttendance> = (event, person): boolean => {
    return person.attendance.option == 'Whole event'
  }

  getDefaultData = (event: TEvent<any, any, TEventOptionsAttendance, any>) => ({ option: event.attendance.attendanceOptions[0].option })

  PersonCardElement: AttendancePersonCardElement<TEventOptionsAttendance> = ({ person, event }) => {
    return (
      <Text>
        <b>Attendance</b>: {person.attendance?.option || 'No option selected'}
      </Text>
    )
  }
}
