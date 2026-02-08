import { Grid, Textarea, Title } from '@mantine/core'

import { errorProps } from '../../utils'
import { useFormContext } from 'react-hook-form'
import { BookingSchemaForType } from '../../../../shared/schemas/booking'
import z from 'zod/v4'

export const CampingFormSection: React.FC = () => {
  const { register, formState } = useFormContext<z.infer<typeof BookingSchemaForType>>()
  

  const { errors } = formState
  const e = errorProps(errors)

  return (
    <Grid.Col span={12}>
      <Title size="h4" order={2} mt={16} id="step-camping">Camping</Title>
      <Textarea
        mt={8}
        label="Which other districts or groups do you want to camp with:"
        {...register('camping.who')}
        {...e('camping.who')}
        autoComplete={`section-camping who`}
        id={`section-camping-who`}
        data-form-type="other"
      />
      <Textarea
        mt={8}
        label="What camping equipment can you provide?"
        {...register('camping.equipment')}
        {...e('camping.equipment')}
        autoComplete={`section-camping equipment`}
        id={`section-camping-equipment`}
        data-form-type="other"
      />
      <Textarea
        mt={8}
        label="Details of any accessibility needs for your campers:"
        {...register('camping.accessibility')}
        {...e('camping.accessibility')}
        autoComplete={`section-camping accessibility`}
        id={`section-camping-accessibility`}
        data-form-type="other"
      />
    </Grid.Col>
  )
}
