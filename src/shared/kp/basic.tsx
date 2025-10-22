import { Grid, Table, Text, Textarea } from '@mantine/core'
import { useFormContext } from 'react-hook-form'

import { errorProps } from '../../front/src/utils'
import { TBooking } from '../schemas/booking'
import { TEvent, TEventBasicKP } from '../schemas/event'
import { TPerson } from '../schemas/person'
import { ageGroupFromPerson } from '../woodcraft'
import { KPBasicOptions, KPPersonCardSection, KPStructure, ManageKPPageList } from './kp'
import { CustomSelect } from '../../front/src/components/custom-inputs/customSelect'
import { PersonField } from '../personFields'

export class BasicKP implements KPStructure<TEventBasicKP> {
  typeName: 'basic' = 'basic'

  PersonFormSection: React.FC<{ index: number }> = ({ index }) => {
    const { register, formState } = useFormContext<TBooking<TEvent<TEventBasicKP>>>()
    const errors = formState.errors
    const e = errorProps(errors)
    return (
      <Grid.Col span={12}>
         <CustomSelect required label="Diet" id={`person-diet-${index}`} name={`people.${index}.kp.diet`} data={KPBasicOptions.map((d) => ({ value: d, label: d }))} />
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

  ManageKPPageList: ManageKPPageList<TEventBasicKP> = ({ event, campers }) => {
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

  PersonCardSection: KPPersonCardSection<TEventBasicKP> = ({ person }) => {
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

  PersonFields = (event: TEvent<TEventBasicKP>) => {
    class Diet extends PersonField {
      name = 'Diet'
      accessor = 'kp.diet'
      size: number = 100
    }
    
    class DietDetails extends PersonField {
      name = 'Diet Details'
      accessor = (p: TPerson) => p.kp?.details || ''
    }

    return [new Diet(event), new DietDetails(event)]
  }
}
