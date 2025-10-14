import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { ActionIcon, Button, Container, Flex, Grid, keys, Paper, Select, Switch, Text, Textarea, TextInput, Title } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconAlertCircle, IconAlertTriangle, IconTrash } from '@tabler/icons-react'
import { UseMutationResult } from '@tanstack/react-query'
import React, { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Controller, DefaultValues, FieldValues, FormProvider, SubmitHandler, useFieldArray, UseFieldArrayRemove, useForm, useFormContext } from 'react-hook-form'
import { PartialDeep } from 'type-fest'
import { NIL } from 'uuid'

import { AttendanceOptions } from '../../../../shared/attendance/attendance.js'
import { ConsentsOptions } from '../../../../shared/consents/consents.js'
import { getFeeTypesForEvent, maybeGetFeeType } from '../../../../shared/fees/fees.js'
import { KPOptions } from '../../../../shared/kp/kp.js'
import { EventSchema, EventSchemaWhenCreating, TCustomQuestion, TEvent, TEventWhenCreating } from '../../../../shared/schemas/event.js'
import { CustomDatePicker, CustomDateTimePicker } from '../custom-inputs/customDatePicker.js'
import { CustomSelect } from '../custom-inputs/customSelect.js'
import { NumberValue } from '@aws-sdk/util-dynamodb/dist-types/NumberValue.js'
import { useDebounce } from '@react-hook/debounce'
import { z } from "zod/v4";
import { CustomSwitch } from '../custom-inputs/customSwitch.js'
import { deleteEventMuation } from '../../mutations/deleteEvent.js'

type PartialEventType = PartialDeep<TEventWhenCreating, {recurseIntoArrays: true}>

export function EventForm({ inputData, mode, mutation }: { inputData: DefaultValues<TEventWhenCreating>, mode: 'create' | 'edit', mutation: UseMutationResult<any, any, any, any> }) {
  const formMethods = useForm<z.input<typeof EventSchemaWhenCreating>>({ resolver: standardSchemaResolver(EventSchemaWhenCreating), mode: 'onBlur', defaultValues: inputData })
  const { register, control, formState, handleSubmit, watch  } = formMethods

  const onSubmit: SubmitHandler<PartialEventType> = (data) => mutation.mutate(data)


  const feeOptions = getFeeTypesForEvent(watch('attendance.attendanceStructure')).map((k) => ({ value: k.typeName, label: k.name }))
  const feeStructure = watch('fee.feeStructure')
  const feeConfig = React.useMemo(() => maybeGetFeeType(feeStructure), [feeStructure])

  /*     const eventsToCopyFrom  = events.map(e => <MenuItem key={e.id} value={e.id}>
        {e.name}
    </MenuItem>) */

  /*   const copyFromEvent = (e) => {
    const event = events.find((event) => event.id == e.target.value) as Partial<JsonEventType>;
    if (!event) return;
    delete event.id;
    setData({ ...event });
  };
 */

  const deleteEvent = deleteEventMuation(inputData.eventId as string)

  const deleteFunc = (e: React.MouseEvent<HTMLButtonElement>) => {
    if(confirm("Are you sure you want to delete this event? This will remove all bookings for this event!")) {
      deleteEvent.mutate()
    }
  }

  const { isValid, errors } = formState
  return (
    <FormProvider {...formMethods}>
      <Container>
        <Paper shadow="md" radius="md" withBorder mt={16} p="md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Title order={1} size="h2">
              {mode == 'create' ? 'New Event' : `Editing - ${inputData.name}`}
            </Title>
            <Text>{/* JSON.stringify(currentData, null, ' ') */}</Text>
            {/* <Text>{JSON.stringify(errors, null, " ")}</Text> */}
            {/* <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="event-select-label">Copy From</InputLabel>
                    <Select label="Copy From" onChange={copyFromEvent} labelId="event-select-label">
                      <MenuItem key="default" value="default">]
                        Please select
                      </MenuItem>
                      {eventsToCopyFrom}
                    </Select>
                    
                  </FormControl> */}
            <TextInput label="Name" {...register('name')} mt={16} error={errors.name ? errors.name.message : null} />
            <Textarea label="Description" {...register('description')} mt={16} />
            <CustomDatePicker name="startDate" control={control} label="Start Date" mt={16} />
            <CustomDatePicker name="endDate" control={control} label="End Date" mt={16} />
            <CustomDateTimePicker name="bookingDeadline" control={control} label="Booking Deadline" mt={16} />
            <TextInput label="Email Subject Tag" {...register('emailSubjectTag')} mt={16} />
            <TextInput label="Reply-to" {...register('replyTo')} mt={16} />
            <CustomSwitch label="Big Camp Mode" name='bigCampMode' control={control} mt={16} />
            <CustomSwitch label="Organisations" name='organisations' control={control} mt={16} />
            <CustomSwitch label="Applications required?" name='applicationsRequired' control={control} mt={16} />
            <CustomSwitch label="All participant emails" name='allParticipantEmails' control={control} mt={16} />
            <CustomSwitch label="How did you hear question" name='howDidYouHear'  control={control} mt={16} />
            <CustomSelect data={KPOptions} label="KP Structure" name="kp.kpStructure" control={control} mt={16} />
            <CustomSelect data={ConsentsOptions} label="Consent Structure" name="consents.consentsStructure" control={control} mt={16} />
            <CustomSelect data={AttendanceOptions} label="Attendance Structure" name="attendance.attendanceStructure" control={control} mt={16} />
            <CustomSelect data={feeOptions} label="Fee Structure" name="fee.feeStructure" control={control} mt={16} disabled={!watch('attendance.attendanceStructure')} />
            {feeConfig ? <feeConfig.ConfigurationElement /> : null}
            <CustomQuestionsForm />
            <ValidationErrors />
            <Button variant="contained" type='submit' mt={16} disabled={!isValid} loading={mutation.isPending}>{mode == 'create' ? 'Create' : 'Edit'}</Button>
            { mode === "edit" && <Button ml={8} bg="red" variant="contained" type='button' mt={16} onClick={deleteFunc} loading={deleteEvent.isPending}>Delete</Button> }
          </form>
        </Paper>
      </Container>
    </FormProvider>
  )
}

function ValidationErrors() {

  const { watch, getValues } = useFormContext<TEventWhenCreating>()
  const [formstate, setFormstate] = useDebounce<PartialEventType>(() => watch(), 1000)

  useEffect(() => {
    const { unsubscribe } = watch((value) => {
      setFormstate(value)
    })
    return () => unsubscribe()
  }, [watch])

  const validation = useMemo(() => {
    const valid = EventSchemaWhenCreating.safeParse(formstate)
    return valid
  }
  , [formstate])

  if (validation.success) return null
  return (
    <Paper shadow="md" radius="md" withBorder mt={16} p="lg" c="yellow.9" bg="yellow.0" bd="1 solid yellow.3">
      <Flex gap="xs" align="center" mb={8}>
       <IconAlertTriangle size={32} stroke={1.5} color="orange" />
      <Title order={2} size="h4">Validation Errors</Title>
      </Flex>
      {validation.error.issues.map((issue) => (
        <Text key={issue.path.join('.')}>
          {issue.path.join('.')} - {issue.message}
        </Text>
      ))}
    </Paper>
  )
}

function CustomQuestionsForm() {
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    name: 'customQuestions', // unique name for your Field Array
  })

  const questions = fields.map((f, i) => {
    return <QuestionItem index={i} key={f.id} remove={remove} />
  })

  return (
    <Grid>
      <Grid.Col>
      <Title order={2} size="h5">
        Custom Questions
      </Title>
      {questions}
      <Button variant="contained" onClick={() => append({})} mt={16}>
        Add Question
      </Button>
      </Grid.Col>
    </Grid>
  )
}

const QuestionItem = ({ index, remove }: { index: number; remove: UseFieldArrayRemove }) => {
  const { register, control } = useFormContext<Pick<PartialEventType, 'customQuestions'>>()

  return (
    <Paper shadow="md" radius="md" withBorder mt={16} p="md">
      <Grid>
        <Grid.Col span={3}>
          <CustomSelect
            control={control}
            name={`customQuestions.${index}.questionType`}
            label="Question Type"
            data={[
              { value: 'yesnochoice', label: 'Yes/No' },
              { value: 'text', label: 'Text' },
              { value: 'longtext', label: 'Long Text' },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <TextInput label="Question Label" {...register(`customQuestions.${index}.questionLabel` as const)} error={null} />
        </Grid.Col>
        <Grid.Col span={1}>
          <ActionIcon variant="default" size="input-sm" onClick={() => remove(index)} mt={24}>
            <IconTrash size={16} stroke={1.5} color="red" />
          </ActionIcon>
        </Grid.Col>
      </Grid>
    </Paper>
  )
}
