//import { FormGroup, Grid, Paper, TextField, Typography, Box, Button, FormControlLabel, Switch, MenuItem, Select, FormControl, InputLabel, ButtonGroup, Stack, IconButton, Card, CardContent, Grow, Checkbox, Alert, AlertTitle } from "@mui/material"
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Container, Paper, Text } from '@mantine/core'
import { useRouteContext } from '@tanstack/react-router'
import { secondsInDay } from 'date-fns/constants'
import React, { useCallback, useContext, useState } from 'react'
import { DefaultValues, FormProvider, useForm } from 'react-hook-form'
//import { JsonBookingType, JsonEventType, JsonUserResponseType, UserResponseType, UserType } from "../../../lambda-common/onetable.js";
//import { ParticipantsForm } from "./participants.js";
//import { kp } from "../../../shared/kp/kp.js"
//import { QuickList } from "./quickList.js";
//import { MemoEmergencyFields } from "./emergency.js";
//import { MemoCustomQuestionFields } from "./custom.js";
//import { MemoBookingMoneySection } from "./money.js";
//import { getFee } from "../../../shared/fee/fee.js";
//import { MemoBookingPermissionSection } from "./permission.js";
//import { BookingValidationResults, Validation } from "./validation.js";
//import { Lock, LockOpen, Delete, Send } from '@mui/icons-material';
//import { generateDiscordDiff, getMemoUpdateFunctions } from "../../../shared/util.js";
//import { LoadingButton } from '@mui/lab'
import { PartialDeep } from 'type-fest'
import { z } from 'zod'

//import { getAttendance } from "../../../shared/attendance/attendance.js";
//import { organisations } from "../../../shared/ifm.js";
//import { MemoBookingExtraContactFields } from "./extraContacts.js";
//import { MemoCampingFields } from "./camping.js";
//import { consent } from "../../../shared/consents/consent.js";
import { BookingSchema, BookingSchemaForType, TBooking } from '../../../../shared/schemas/booking.js'
import { TEvent } from '../../../../shared/schemas/event.js'
import { BasicFieldsBig, BasicFieldsSmall } from './basicFields.js'
import { ExtraContactsForm } from './extraContacts.js'
import { PeopleForm } from './people.js'
import { ValidationErrors } from './validation.js'

//const MemoParticipantsForm = React.memo(ParticipantsForm)

type BookingFormProps = {
  mode: 'create' | 'edit' | 'rebook' | 'view'
  event: TEvent
  inputData: DefaultValues<TBooking>
}

export const BookingForm: React.FC<BookingFormProps> = ({ mode, event, inputData }) => {
  // export function BookingForm({ data, originalData, event, user, update, submit, mode, deleteBooking, submitLoading, deleteLoading }: { data: PartialDeep<JsonBookingType>, originalData: PartialDeep<JsonBookingType>, event: JsonEventType, user: JsonUserResponseType, update: React.Dispatch<React.SetStateAction<PartialDeep<JsonBookingType>>>, submit: (notify) => void, mode: "create" | "edit" | "rebook" | "view", deleteBooking: any, submitLoading: boolean, deleteLoading: boolean }) {
  const { user } = useRouteContext({ from: '/_user' })
  const readOnly = mode === 'view'
  const own = inputData.userId === user.userId

  const schema = BookingSchema(event)
  const formMethods = useForm<z.input<typeof schema>>({ resolver: zodResolver(schema), mode: 'onBlur', defaultValues: inputData })
  const { formState, handleSubmit } = formMethods

  const [permission, updatePermission] = useState({ permission: readOnly })
  const [deleteLock, setDeleteLock] = useState(true)
  const [notify, setNotify] = useState(false)

  const BasicFields = event.bigCampMode ? BasicFieldsBig : BasicFieldsSmall //MemoBookingGroupContactFields : MemoBookingIndvidualContactFields

  // const { updateSubField } = getMemoUpdateFunctions(update)

  /* const create = useCallback(e => {
        submit(notify)
        e.preventDefault()
    }, [submit, notify])

    const fee = getFee(event) */

  /*     const BasicFields = event.bigCampMode ? MemoBookingGroupContactFields : MemoBookingIndvidualContactFields
    const kpConfig = React.useMemo(() => kp[event.kpMode] || kp.basic, [event]);
    const consentConfig = React.useMemo(() => consent[event.consentMode] || consent.none, [event]);
    const attendanceConfig = React.useMemo(() => getAttendance(event), [event]);
    const validation = React.useMemo(() => new Validation(event), [event]);

    const validationResults = validation.validate(data, permission.permission)

    //@ts-ignore
    const diff = validationResults.length == 0 ? generateDiscordDiff(originalData, data) : []
 */

  const { errors } = formState

  const errorElements = Object.entries(errors).map(([key, value]) => {
    return (
      <Text key={key} color="red">
        {key}: {value.message}
      </Text>
    )
  })
 
  const MemoValidate = React.memo(ValidationErrors)

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <Container>
          <Paper shadow="md" radius="md" withBorder mt={16} p="md">
            <BasicFields event={event} />
            <ExtraContactsForm />
            <PeopleForm event={event}/>
            {errorElements}
            <MemoValidate schema={schema} />
            <Button variant="contained" type="submit" mt={16}>
              Submit Booking
            </Button>
          </Paper>
        </Container>
      </form>
    </FormProvider>
  )
  return (
    <Grid container spacing={2} p={2} justifyContent="center">
      <Grid xl={6} lg={7} md={8} sm={9} xs={12} item>
        <Box p={2}>
          <form>
            <Typography variant="h4">{`Booking for ${event.name}`}</Typography>
            {readOnly ? (
              <Alert variant="outlined" severity="warning" sx={{ mt: 2, pt: 2 }}>
                <AlertTitle>This view read-only</AlertTitle>
                As the deadline has passed you can no longer update your booking. If you need to make changes please contact the camp team at{' '}
                <a href="mailto:info@camp100.org.uk">info@camp100.org.uk</a> and they can make the changes or allow you to edit it yourself.
              </Alert>
            ) : null}
            <BasicFields data={data.basic} update={updateSubField} readOnly={readOnly} />
            <MemoParticipantsForm
              basic={data.basic as JsonBookingType['basic']}
              event={event}
              attendanceConfig={attendanceConfig}
              participants={data.participants || [{}]}
              update={updateSubField}
              kp={kpConfig}
              consent={consentConfig}
              validation={validation}
              own={own}
              readOnly={readOnly}
            />
            <MemoCampingFields event={event} data={data.camping} update={updateSubField} readOnly={readOnly} />
            <MemoEmergencyFields event={event} data={data.emergency} bookingType={data.basic?.bookingType || 'individual'} update={updateSubField} readOnly={readOnly} />
            <MemoCustomQuestionFields event={event} data={data.customQuestions} basic={data.basic} camping={data.camping} update={updateSubField} readOnly={readOnly} />
            <MemoBookingMoneySection fees={fee} event={event} data={data} originalData={originalData} />
            <MemoBookingPermissionSection event={event} data={permission} update={updatePermission} readOnly={readOnly} />
            <BookingValidationResults validationResults={validationResults} />
            <Stack direction="row" spacing={1} mt={2}>
              <LoadingButton onClick={create} endIcon={<Send />} loading={submitLoading} loadingPosition="end" variant="contained" disabled={validationResults.length > 0 || readOnly}>
                <span>Submit</span>
              </LoadingButton>
              {mode === 'edit' ? (
                <>
                  <LoadingButton loading={deleteLoading} variant="contained" color="error" disabled={deleteLock} onClick={deleteBooking} startIcon={<Delete />}>
                    Cancel Booking
                  </LoadingButton>
                  <IconButton color="warning" onClick={() => setDeleteLock(!deleteLock)}>
                    {deleteLock ? <Lock /> : <LockOpen />}
                  </IconButton>
                </>
              ) : null}
              {mode === 'edit' && !own ? <FormControlLabel sx={{ mt: 2 }} control={<Switch checked={notify} onChange={() => setNotify(!notify)} />} label="Notify Booking Owner" /> : null}
            </Stack>
            {mode === 'edit' && diff.length > 0 && validationResults.length === 0 ? (
              <>
                <Alert severity="info" sx={{ mt: 2, pt: 2 }}>
                  <AlertTitle>Changes you have made:</AlertTitle>
                  {diff.map((d, i) => (
                    <Typography variant="body2" key={i}>
                      {d}
                    </Typography>
                  ))}
                </Alert>
              </>
            ) : null}
          </form>
        </Box>
      </Grid>
      <QuickList participants={data.participants || []} event={event} />
    </Grid>
  )
}
