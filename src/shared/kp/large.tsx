import { Divider, Grid, Table, Text, Textarea } from '@mantine/core'
import { useFormContext } from 'react-hook-form'

import { CustomCheckbox } from '../../front/src/components/custom-inputs/customCheckbox'
import { CustomSelect } from '../../front/src/components/custom-inputs/customSelect'
import { errorProps } from '../../front/src/utils'
import { getAttendanceType } from '../attendance/attendance'
import { TBooking } from '../schemas/booking'
import { TEvent, TEventBasicKP, TEventLargeKP } from '../schemas/event'
import { TPerson } from '../schemas/person'
import { ageGroupFromPerson } from '../woodcraft'
import { KPBasicOptions, KPPersonCardSection, KPStructure, ManageKPPageList } from './kp'

export class LargeKP implements KPStructure<TEventLargeKP> {
  typeName: 'large' = 'large'

  PersonFormSection: React.FC<{ index: number }> = ({ index }) => {
    const { register, formState } = useFormContext<TBooking<TEvent<TEventLargeKP>>>()
    const errors = formState.errors
    const e = errorProps(errors)

    const TypedBox = CustomCheckbox<TBooking<TEvent<TEventLargeKP>>>

    return (
      <>
        <Grid.Col span={12}>
          <Divider my="xs" label="Diet" labelPosition="center" />
        </Grid.Col>
        <Grid.Col span={8}>
          <Text size='sm'>Choose the diet you want on camp. Only choose omnivore if you want to eat meat on camp. Camp is a great time to try out a vegetarian diet.</Text>
        </Grid.Col>
        <Grid.Col span={4}>
          <CustomSelect required label="Diet" id={`person-diet-${index}`} name={`people.${index}.kp.diet`} data={KPBasicOptions.map((d) => ({ value: d, label: d }))} />
        </Grid.Col>
        <Grid.Col span={12}>
          <Text mt={16} size='sm'>
            <b>Dietary Requirements:</b> Please include any known allergies even if the diet you have selected would exclude them:
          </Text>
        </Grid.Col>
        <Grid.Col span={{ base: 6, xs: 4, sm: 3 }}>
          <TypedBox label="Nut Free" id={`person-nut-${index}`} name={`people.${index}.kp.nut`} m={4} />
        </Grid.Col>
        <Grid.Col span={{ base: 6, xs: 4, sm: 3 }}>
          <TypedBox label="Gluten Free" id={`person-gluten-${index}`} name={`people.${index}.kp.gluten`} m={4} />
        </Grid.Col>
        <Grid.Col span={{ base: 6, xs: 4, sm: 3 }}>
          <TypedBox label="Soya Free" id={`person-soya-${index}`} name={`people.${index}.kp.soya`} m={4} />
        </Grid.Col>
        <Grid.Col span={{ base: 6, xs: 4, sm: 3 }}>
          <TypedBox label="Dairy/Lactose Free" id={`person-dairy-${index}`} name={`people.${index}.kp.dairy`} m={4} />
        </Grid.Col>
        <Grid.Col span={{ base: 6, xs: 4, sm: 3 }}>
          <TypedBox label="Egg Free" id={`person-egg-${index}`} name={`people.${index}.kp.egg`} m={4} />
        </Grid.Col>
        <Grid.Col span={{ base: 6, xs: 4, sm: 3 }}>
          <TypedBox label="Pork Free" id={`person-pork-${index}`} name={`people.${index}.kp.pork`} m={4} />
        </Grid.Col>
        <Grid.Col span={{ base: 6, xs: 4, sm: 3 }}>
          <TypedBox label="Chickpea Free" id={`person-chickpea-${index}`} name={`people.${index}.kp.chickpea`} m={4} />
        </Grid.Col>
        <Grid.Col span={{ base: 6, xs: 4, sm: 3 }}>
          <TypedBox label="Diabetic" id={`person-diabetic-${index}`} name={`people.${index}.kp.diabetic`} m={4} />
        </Grid.Col>
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
            mt={16}
          />
          <TypedBox mt={16} label="My allergies or dietary needs are complicated and I would like to be contacted by the camp team" id={`person-contact-${index}`} name={`people.${index}.kp.contactMe`} />
        <Textarea
            autoComplete={`section-person-${index} diet-preferences`}
            id={`person-details-${index}`}
            data-form-type="other"
            label="Food dislikes or preferences (not allergies)"
            {...register(`people.${index}.kp.preferences` as const)}
            {...e(`people.${index}.kp.preferences`)}
            autosize
            minRows={2}
            mt={16}
          />
        </Grid.Col>
      </>
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
              <Table.Td>
                <Text span c="green">
                  {attendance.circles && attendance.isWholeAttendance && c.attendance?.bitMask && !attendance.isWholeAttendance(event, c) ? attendance.circles(c.attendance.bitMask, event) : null}
                </Text>
              </Table.Td>
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
