import { Table, Text } from '@mantine/core'

import { TBooking } from '../schemas/booking'
import { TEvent, TEventBasicKP } from '../schemas/event'
import { TPerson } from '../schemas/person'
import { ageGroupFromPerson } from '../woodcraft'
import { KPStructure } from './kp'

export class BasicKP implements KPStructure<TEventBasicKP> {
  typeName: 'basic' = 'basic'

  ManageKPPageList: React.FC<{ event: TEvent<TEventBasicKP>; campers: TPerson<TEvent<TEventBasicKP>>[] }> = ({ event, campers }) => {
    const interestingCampers = campers.filter((c) => c.kp.details && c.kp.details !== '')

    const ageFn = ageGroupFromPerson(event)

    return (
      <Table mt={16} striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Age</Table.Th>
            <Table.Th>Details</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {interestingCampers.map((c) => (
            <Table.Tr key={c.personId}>
              <Table.Td>{c.basic.name}</Table.Td>
              <Table.Td>{ageFn(c).toAgeGroupString()}</Table.Td>
              <Table.Td>{c.kp.details}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    )
  }

  PersonCardSection: React.FC<{ person: TPerson<TEvent<TEventBasicKP>> }> = ({ person }) => {
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
