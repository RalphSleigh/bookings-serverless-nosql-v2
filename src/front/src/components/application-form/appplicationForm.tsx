import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Container, Grid, Paper, RadioGroup, Text, TextInput, Title } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { useRouteContext } from '@tanstack/react-router'
import { FormProvider, useController, useForm, useWatch } from 'react-hook-form'

import { ApplicationSchemaForForm, TApplication, TApplicationForForm } from '../../../../shared/schemas/application'
import { createApplicationMuation } from '../../mutations/createApplication'
import { errorProps, useEvent } from '../../utils'
import { CustomNumberInput } from '../custom-inputs/customNumberInput'
import { TypeSelector } from './typeSelector'

export const ApplicationForm = () => {
  const { user } = useRouteContext({ from: '/_user' })
  const event = useEvent()

  const form = useForm({ resolver: zodResolver(ApplicationSchemaForForm), mode: 'onBlur', defaultValues: { userId: user.userId, eventId: event.eventId, name: user.isGroupAccount ? '' : user.name, email: user.email } })

  const { errors, isValid } = form.formState
  const { register } = form

  const e = errorProps(errors)

  const type = form.watch('type')

  const mutation = createApplicationMuation(event)
  const onSubmit = (data: TApplicationForForm) => {
    console.log('Submitting application:', data)
    mutation.mutate(data)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Container>
          <Paper shadow="md" radius="md" withBorder mt={16} p="md">
            <Title order={1} size="h2" mb={16}>
              Application for {event.name}
            </Title>
            <Text>
              We require everyone booking to first go through an application step to help with the booking admin. Once you have submitted this our team will review it and if approved you will be
              emailed a confirmation and can then come back and fill in the booking form. We may alternativly ask you to get in contact with someone who is already doing booking for your group/area.
            </Text>
            <Text mb={16}>Please select the type of booking you plan to make:</Text>
            <TypeSelector />
            <TextInput mt={8} autoComplete="name" id="name" data-form-type="name" required label="Your Name" {...register('name')} {...e('name')} />
            <TextInput autoComplete="email" id="email" data-form-type="email" required type="email" label="Your email" {...register('email')} {...e('email')} />
            <PrivateRelayWarning />
            <TextInput required={type === 'group'} label="Group/District" id="district" data-form-type="other" {...register('district')} {...e('district')} />
            <CustomNumberInput mt={8} name="predicted" label="How many people do you expect to book?" required />
            <Button variant="gradient" mt={16} gradient={{ from: 'cyan', to: 'green', deg: 110 }} type="submit" disabled={!isValid}>
              Submit
            </Button>
          </Paper>
        </Container>
      </form>
    </FormProvider>
  )
}

const PrivateRelayWarning = () => {
  const email = useWatch<TApplication, 'email'>({ name: 'email' })
  const isPrivateRelay = email && email?.includes('privaterelay.appleid.com')
  if (!isPrivateRelay) return null
  return (
    <Alert
      mt={16}
      variant="light"
      color="yellow"
      title="This appears to be an Apple private relay address, we recommend you provide your actual email address, otherwise we may be unable to contact you. This will not be shared outside the camp team."
      icon={<IconInfoCircle />}
    ></Alert>
  )
}
