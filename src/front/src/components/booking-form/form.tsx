//import { FormGroup, Grid, Paper, TextField, Typography, Box, Button, FormControlLabel, Switch, MenuItem, Select, FormControl, InputLabel, ButtonGroup, Stack, IconButton, Card, CardContent, Grow, Checkbox, Alert, AlertTitle } from "@mui/material"
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button, Container, Grid, Paper, Text, Textarea, Title } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { UseMutationResult } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import React, { useCallback, useContext, useState } from 'react'
import { DefaultValues, FormProvider, useForm } from 'react-hook-form'
import { PartialDeep } from 'type-fest'
import { z } from 'zod/v4'

import { getFeeType } from '../../../../shared/fees/fees.js'
//import { getAttendance } from "../../../shared/attendance/attendance.js";
//import { organisations } from "../../../shared/ifm.js";
//import { MemoBookingExtraContactFields } from "./extraContacts.js";
//import { MemoCampingFields } from "./camping.js";
//import { consent } from "../../../shared/consents/consent.js";
import { BookingSchema, BookingSchemaForType, TBooking, TBookingForType } from '../../../../shared/schemas/booking.js'
import { TEvent } from '../../../../shared/schemas/event.js'
import { PersonSchemaForType } from '../../../../shared/schemas/person.js'
import { BasicFieldsBig, BasicFieldsSmall } from './basicFields.js'
import { ExtraContactsForm } from './extraContacts.js'
import { OtherQuestionsForm } from './otherQuestions.js'
import { PeopleForm } from './people.js'
import { PermissionForm } from './permission.js'
import { BookingSummary } from './summary.js'
import { ValidationErrors } from './validation.js'

//const MemoParticipantsForm = React.memo(ParticipantsForm)

type BookingFormProps = {
  mode: 'create' | 'edit' | 'rebook' | 'view'
  event: TEvent
  inputData: DefaultValues<TBooking>
  mutation: UseMutationResult<any, any, any, any>
}

export const BookingForm: React.FC<BookingFormProps> = ({ mode, event, inputData, mutation }) => {
  // export function BookingForm({ data, originalData, event, user, update, submit, mode, deleteBooking, submitLoading, deleteLoading }: { data: PartialDeep<JsonBookingType>, originalData: PartialDeep<JsonBookingType>, event: JsonEventType, user: JsonUserResponseType, update: React.Dispatch<React.SetStateAction<PartialDeep<JsonBookingType>>>, submit: (notify) => void, mode: "create" | "edit" | "rebook" | "view", deleteBooking: any, submitLoading: boolean, deleteLoading: boolean }) {
  const { user } = useRouteContext({ from: '/_user' })
  const readOnly = mode === 'view'
  const own = inputData.userId === user.userId

  const schema = BookingSchema(event)
  type BookingFormValues = z.infer<typeof schema>
  const formMethods = useForm<BookingFormValues>({ resolver: standardSchemaResolver(schema), mode: 'onTouched', defaultValues: inputData as BookingFormValues })
  const { formState, handleSubmit } = formMethods
  const { isValid } = formState

  const onSubmit = useCallback(
    (data: z.infer<typeof schema>) => {
      console.log('Submitting booking data:', data)
      mutation.mutate({ event, booking: data })
    },
    [event, mutation],
  )

  const BasicFields = event.bigCampMode ? BasicFieldsBig : BasicFieldsSmall //MemoBookingGroupContactFields : MemoBookingIndvidualContactFields

  // const { updateSubField } = getMemoUpdateFunctions(update)

  /*     const BasicFields = event.bigCampMode ? MemoBookingGroupContactFields : MemoBookingIndvidualContactFields
    const kpConfig = React.useMemo(() => kp[event.kpMode] || kp.basic, [event]);
    const consentConfig = React.useMemo(() => consent[event.consentMode] || consent.none, [event]);
    const attendanceConfig = React.useMemo(() => getAttendance(event), [event]);
    const validation = React.useMemo(() => new Validation(event), [event]);

    const validationResults = validation.validate(data, permission.permission)

    //@ts-ignore
    const diff = validationResults.length == 0 ? generateDiscordDiff(originalData, data) : []
 */

  const MemoValidate = React.memo(ValidationErrors)

  const matches = useMediaQuery('(min-width: 62em)')

  const fees = getFeeType(event)

  const [checked, setChecked] = React.useState(false)

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid gutter={0}>
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Paper shadow="md" radius="md" withBorder m={8} p="md">
              <BasicFields event={event} />
              {event.bigCampMode && <ExtraContactsForm />}
              <PeopleForm event={event} />
              <OtherQuestionsForm />
              <Title order={3} mt={8}>
                Pricing
              </Title>
              <fees.BookingFormDisplayElement event={event} />
              <MemoValidate schema={schema} />
              <PermissionForm event={event} checked={checked} setChecked={setChecked} />
              <Button variant="contained" type="submit" mt={16} loading={mutation.isPending} disabled={!isValid || mutation.isPending || !checked}>
                Submit Booking
              </Button>
            </Paper>
          </Grid.Col>
          {matches && (
            <Grid.Col span={{ base: 12, md: 3 }}>
              <BookingSummary />
            </Grid.Col>
          )}
        </Grid>
      </form>
    </FormProvider>
  )
}
