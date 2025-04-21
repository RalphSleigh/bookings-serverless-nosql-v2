import { Grid, TextInput, Title, Text, Textarea } from '@mantine/core'
import { useFormContext } from 'react-hook-form'
import { AttendanceTypes } from '../attendance/attendance'
import { TEalingFees, TEvent, TFees } from '../schemas/event'
import { FeeStructure, FeeStructureCondfigurationElement, FeeStructureConfigData } from './feeStructure'

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
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Unaccompanied" {...register('fee.ealingData.unaccompanied', {valueAsNumber: true})} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Unaccompanied Discount" {...register('fee.ealingData.unaccompaniedDiscount', {valueAsNumber: true})} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Accompanied" {...register('fee.ealingData.accompanied', {valueAsNumber: true})} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput leftSection={pound} leftSectionPointerEvents="none" label="Accompanied Discount" {...register('fee.ealingData.accompaniedDiscount', {valueAsNumber: true})} />
          </Grid.Col>
        </Grid>
        <Textarea autosize={true} label="Payment instructions" {...register('fee.ealingData.paymentInstructions')} />
      </>
    )
  }
}
