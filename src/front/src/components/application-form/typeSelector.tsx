import { Grid, Paper, Radio, RadioGroup, Text } from '@mantine/core'
import { useController, useWatch } from 'react-hook-form'

import { TApplication } from '../../../../shared/schemas/application'

export const TypeSelector = () => {
  const radioController = useController({ name: 'type' })

  const paperProps = (field: string) => (value: string | undefined) => {
    const props = { withBorder: true, p: 'md', style: { height: '100%', cursor: 'pointer' } }
    if (field === value) {
      return { bd: '1 solid green', bg: 'green.0', c: 'green.9', ...props }
    } else {
      return { bd: '1 solid gray', bg: 'gray.0', c: 'gray.9', ...props }
    }
  }

  const applicationType = useWatch<TApplication, 'type'>({ name: 'type' })

  return (
    <RadioGroup
      value={radioController.field.value}
      onChange={(value) => {
        radioController.field.onChange(value)
      }}
      name="bookingType"
      required
    >
      <Grid mt={16}>
        <Grid.Col span={6}>
          <Paper
            {...paperProps('group')(applicationType)}
            onClick={() => {
              radioController.field.onChange('group')
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
              radioController.field.onChange('individual')
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
