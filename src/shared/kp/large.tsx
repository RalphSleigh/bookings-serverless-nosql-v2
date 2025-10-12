import { Grid, Table, Text, Textarea } from '@mantine/core'
import { useFormContext } from 'react-hook-form'

import { errorProps } from '../../front/src/utils'
import { getAttendanceType } from '../attendance/attendance'
import { TBooking } from '../schemas/booking'
import { TEvent, TEventBasicKP, TEventLargeKP } from '../schemas/event'
import { TPerson } from '../schemas/person'
import { ageGroupFromPerson } from '../woodcraft'
import { KPPersonCardSection, KPStructure, ManageKPPageList } from './kp'

export class LargeKP implements KPStructure<TEventLargeKP> {
  typeName: 'large' = 'large'

  PersonFormSection: React.FC<{ index: number }> = ({ index }) => {
    const { register, formState } = useFormContext<TBooking<TEvent<TEventLargeKP>>>()
    const errors = formState.errors
    const e = errorProps(errors)
    return (
      <Grid.Col span={12}>
        <Textarea
          autoComplete={`section-person-${index} diet-details`}
          id={`person-details-${index}`}
          data-form-type="other"
          label="Additional dietary requirement or food related allergies"
          {...register(`people.${index}.kp.details` as const)}
          {...e(`people.${index}.kp.details`)}
          autosize
          minRows={2}
        />
      </Grid.Col>
    )
  }

  ManageKPPageList: ManageKPPageList<TEventLargeKP> = ({ event, campers }) => {
    const interestingCampers = campers.filter((c) => c.kp.details && c.kp.details !== '')

    const ageFn = ageGroupFromPerson(event)
    const attendance = getAttendanceType(event)

    return (
      <Table mt={16} striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th></Table.Th>
            <Table.Th>Age</Table.Th>
            <Table.Th>Details</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {interestingCampers.map((c) => (
            <Table.Tr key={c.personId}>
              <Table.Td>{c.basic.name}</Table.Td>
              <Table.Td><Text span c="green">{attendance.circles && attendance.isWholeAttendance && c.attendance?.bitMask && !attendance.isWholeAttendance(event, c) ? attendance.circles(c.attendance.bitMask, event) : null}</Text></Table.Td>
              <Table.Td>{ageFn(c).toAgeGroupString()}</Table.Td>
              <Table.Td>{c.kp.details}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    )
  }

    PersonCardSection: KPPersonCardSection = ({ person }) => {
    return (
      <>
        <Text>
          {' '}
          <b>Diet:</b> {person.kp.diet}
        </Text>
        {person.kp.details && (
          <Text>
            {' '}
            <b>Diet Details:</b> {person.kp.details}
          </Text>
        )}
      </>
    )
  }
}
