import { Flex, Paper, Text, Title } from '@mantine/core'
import { useDebounce } from '@react-hook/debounce'
import { IconAlertTriangle } from '@tabler/icons-react'
import React, { useEffect, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { PartialDeep } from 'type-fest'
import { z } from "zod/v4";

import { BookingSchema, BookingSchemaForType, PartialBookingType, TBookingForType } from '../../../../shared/schemas/booking'


type ValidationErrorsProps = {
  schema: ReturnType<typeof BookingSchema>
}

const mapValidationError = (data: PartialBookingType) => (issue: z.core.$ZodIssue) => {
  if (issue.path[0] === 'basic') {
    if (issue.path[1] === 'type') return `Please select a booking type`
    if (issue.path[1] === 'organisation') return `Please enter your organisation name`
    if (issue.path[1] === 'district') return `Please enter your district name`
    if (issue.path[1] === 'name') return `Please enter your name`
    if (issue.path[1] === 'email') return `Please enter your email address`
    if (issue.path[1] === 'telephone') return `Please enter your telephone number`
  }

  if (issue.path[0] === 'people' && typeof issue.path[1] === 'number') {
    const personIndex = issue.path[1]
    const name = data?.people?.[personIndex]?.basic?.name
    if (name) {
      if (issue.path[2] === 'basic' && issue.path[3] === 'email') return `Please enter an email address for ${name}`
      if (issue.path[2] === 'basic' && issue.path[3] === 'dob') return `Please enter a DoB for ${name}`
    } else {
      if(issue.path[2] === 'basic' && issue.path[3] === 'name') return `Please enter a name for person ${personIndex + 1}`
      return null
    }
  }

  return `${issue.path.join('.')} - ${issue.message}`
}

const ValidationMessages: React.FC<{messages: string[]}> = ({ messages }) => { 
  return (
    <Paper shadow="md" radius="md" withBorder mt={16} p="lg" c="yellow.9" bg="yellow.0" bd="1 solid yellow.3">
      <Flex gap="xs" align="center" mb={8}>
        <IconAlertTriangle size={32} stroke={1.5} color="orange" />
        <Title order={2} size="h4">
          Validation Errors
        </Title>
      </Flex>
      {messages.map((message, i) => (
        <Text key={i}>{message}</Text>
      ))}
    </Paper>
  )
}

const MemoValidationMessages = React.memo(ValidationMessages)

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({ schema }) => {
  const data = useWatch<z.input<typeof BookingSchemaForType>>()
  const [formstate, setFormstate] = useDebounce<PartialBookingType>(() => data, 500)
  setFormstate(data)

  console.log('rendering validation')
  const messages = useMemo(() => {
    const valid = schema.safeParse(formstate)
    if (valid.success) return null
    const mapper = mapValidationError(formstate)
    const messages = valid.error.issues.map(mapper).filter((issue) => issue !== null)
    console.log('updating valid')
    return messages
  }, [formstate])

  if (!messages || messages.length == 0) return null

  return <MemoValidationMessages messages={messages}/>
}
