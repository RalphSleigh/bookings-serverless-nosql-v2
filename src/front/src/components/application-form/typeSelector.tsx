import { Grid, Paper, Radio, RadioGroup, Text } from '@mantine/core'
import { useEffect } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'

import { TApplication } from '../../../../shared/schemas/application'
import classes from '../../css/typeChooser.module.css'

export const TypeSelector = () => {
  const { register, setValue } = useFormContext()
  const selectValue = useWatch<TApplication, 'type'>({ name: 'type' })

  useEffect(() => {
    register('type')
  }, [register])

  const paperProps = (field: string) => (value: string | undefined) => {
    const props = { withBorder: true, p: 'md', style: { height: '100%', cursor: 'pointer' } }
    if (field === value) {
      return { className: classes.chooserSelected, ...props }
    } else {
      return { className: classes.chooserUnselected, ...props }
    }
  }

  const applicationType = useWatch<TApplication, 'type'>({ name: 'type' })

  return (
    <RadioGroup
      value={selectValue}
      /*       onChange={(value) => {
        radioController.field.onChange(value)
      }} */
      name="bookingType"
      required
    >
      <Grid mt={16}>
        <Grid.Col span={6}>
          <Paper
            {...paperProps('group')(applicationType)}
            onClick={() => {
              setValue('type', 'group', { shouldValidate: true })
            }}
          >
            <Radio value="group" style={{ float: 'right' }} />
            <Text size="lg">Group Booking</Text>
            <Text> If you are booking for a Woodcraft Folk District, Group, or other large booking, please select this option.</Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={6}>
          <Paper
            {...paperProps('individual')(applicationType)}
            onClick={() => {
              setValue('type', 'individual', { shouldValidate: true })
            }}
          >
            <Radio value="individual" style={{ float: 'right' }} />
            <Text size="lg">Individual Booking</Text>
            <Text> If you are booking just yourself or your family members, please select this option.</Text>
          </Paper>
        </Grid.Col>
      </Grid>
    </RadioGroup>
  )
}
