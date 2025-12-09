import { Anchor, Box, Paper, Stepper, Text, Title } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import e from 'express'
import { useMemo, useState } from 'react'
import z from 'zod/v4'

import { BookingSchema, PartialBookingType } from '../../../../shared/schemas/booking'
import { TEvent } from '../../../../shared/schemas/event'
import { WatchDebounce } from '../../utils'

const indexToStep = (event: TEvent) => (index: number) => {
  if (event.bigCampMode) {
    if (index === 0) return 'type'
    if (index === 1) return 'basic'
    if (index === 2) return 'people'
    if (index === 3) return 'camping'
    if (index === 4) return 'fees'
    if (index === 5) return 'permission'
  } else {
    if (index === 0) return 'basic'
    if (index === 1) return 'people'
    if (index === 2) return 'other'
    if (index === 3) return 'fees'
    if (index === 4) return 'permission'
  }
  return 'basic'
}

const getStateFromValid = (errors: z.core.$ZodIssue[] | undefined, event: TEvent, checked: boolean) => {
  for (const issue of errors || []) {
    if (event.bigCampMode) {
      if (issue.path[0] === 'basic' && issue.path[1] === 'type') return 0
      if (issue.path[0] === 'basic') return 1
      if (issue.path[0] === 'people') return 2
      if (issue.path[0] === 'camping') return 3
      if (issue.path[0] === 'fees') return 4
    } else {
      if (issue.path[0] === 'basic') return 0
      if (issue.path[0] === 'people') return 1
      if (issue.path[0] === 'other') return 2
      if (issue.path[0] === 'fees') return 3
    }
  }

  if (event.bigCampMode) {
    if (!checked) return 5
  } else {
    if (!checked) return 4
  }
  return 6
}

export const BookingStepper: React.FC<{ event: TEvent; schema: ReturnType<typeof BookingSchema>; checked: boolean }> = ({ event, schema, checked }) => {
  const [booking, setBooking] = useState<PartialBookingType>({})
  const navitage = useNavigate()

  const onStepClick = (step: number) => {
    const stepName = indexToStep(event)(step)
    navitage({ hash: `#step-${stepName}` })
  }

  const state = useMemo(() => {
    const valid = schema.safeParse(booking)
    if (valid.success && checked) return 6
    return getStateFromValid(valid.error?.issues, event, checked)
  }, [booking, checked])

  return (
    <>
      <WatchDebounce value={booking} set={setBooking} duration={500} name={undefined} />
      <Box style={{ position: 'sticky', top: 56 }} p={8}>
        <Stepper active={state} orientation="vertical" onStepClick={onStepClick} color="green">
          {event.bigCampMode && <Stepper.Step label="Booking Type" description="What sort of booking are you making?" />}
          <Stepper.Step label="Your details" description="Some basic information about you" />
          <Stepper.Step label="People" description="Details of the people you are bringing" />
          {event.bigCampMode ? <Stepper.Step label="Camping" description="Information about your camping preferences" /> : <Stepper.Step label="Other stuff" description="A couple more questions" />}
          <Stepper.Step label="Fees" description="Details of how much your booking will cost" />
          <Stepper.Step label="Permission" description="Tick the box to continue" />
        </Stepper>
      </Box>
    </>
  )
}
