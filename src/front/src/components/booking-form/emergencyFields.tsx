import { Grid, Text, Textarea, TextInput, Title } from '@mantine/core'
import { useContext } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import z from 'zod/v4'

import { BookingSchemaForType, PartialBookingType } from '../../../../shared/schemas/booking'
import { errorProps } from '../../utils'
import { ReadOnlyContext } from './readOnlyContext'

export const EmergencyContactSection: React.FC = () => {
  const { register, formState } = useFormContext<z.infer<typeof BookingSchemaForType>>()
  const bookingType = useWatch<PartialBookingType, 'basic.type'>({ name: 'basic.type' })
  const readOnly = useContext(ReadOnlyContext)

  const { errors } = formState
  const e = errorProps(errors)

  if (bookingType !== 'individual') {
    return null
  }

  return (
    <Grid.Col span={12}>
      <Title size="h4" order={2} mt={16}>
        Emergency Contact
      </Title>
      <Text>Please supply the name and phone number of an emergency contact.</Text>
      <TextInput disabled={readOnly} autoComplete="emergency name" id="emergencyname" data-form-type="name" required label="Name" {...register('basic.emergencyName')} {...e('basic.emergencyName')} />
      <TextInput
        disabled={readOnly}
        autoComplete="emergency tel"
        id="emergencytelephone"
        data-form-type="phone"
        required
        type="tel"
        label="Phone Number"
        {...register('basic.emergencyTelephone')}
        {...e('basic.emergencyTelephone')}
      />
    </Grid.Col>
  )
}
