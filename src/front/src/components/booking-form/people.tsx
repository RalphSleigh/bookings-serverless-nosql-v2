import { ActionIcon, Anchor, Button, Flex, Grid, Paper, Textarea, TextInput, Title } from '@mantine/core'
import { IconChevronDown, IconChevronUp, IconX } from '@tabler/icons-react'
import { useRouteContext } from '@tanstack/react-router'
import React, { useMemo, useState } from 'react'
import { DefaultValues, useFieldArray, UseFieldArrayRemove, useFormContext, useFormState, useWatch } from 'react-hook-form'
import { v7 as uuidv7 } from 'uuid'
import { z } from 'zod/v4'

import { app } from '../../../../lambda/app.js'
import { KPBasicOptions } from '../../../../shared/kp/kp.js'
import { BookingSchema, BookingSchemaForType, PartialBookingType } from '../../../../shared/schemas/booking.js'
import { TEvent } from '../../../../shared/schemas/event.js'
import { PersonSchema, PersonSchemaForType, TPerson } from '../../../../shared/schemas/person.js'
import { errorProps } from '../../utils.js'
import { CustomDatePicker } from '../custom-inputs/customDatePicker.js'
import { CustomSelect } from '../custom-inputs/customSelect.js'
import { SmallSuspenseWrapper, SuspenseWrapper } from '../suspense.js'
import { SheetsInput } from './sheetsInput.js'

type PeopleFormProps = {
  event: TEvent
  userId: string
}

export const PeopleForm: React.FC<PeopleFormProps> = ({ event, userId }) => {
  const { user } = useRouteContext({ from: '/_user' })
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray<z.infer<typeof BookingSchemaForType>>({
    name: 'people', // unique name for your Field Array
  })

  const defaultCollapsed = fields.length > 10

  const peopleSchema = useMemo(() => PersonSchema(event), [event])

  const people = fields.map((f, i) => {
    return <PersonForm event={event} index={i} key={f.id} remove={remove} defaultCollapsed={defaultCollapsed} peopleSchema={peopleSchema} />
  })

  const appendFn = () => {
    const newPerson = { personId: uuidv7(), eventId: event.eventId, userId: user.userId, cancelled: false }
    append(newPerson as TPerson)
  }

  return (
    <>
      <Title order={2} size="h5" mt={16}>
        People
      </Title>
      <SmallSuspenseWrapper>
        <SheetsInput event={event} userId={userId} />
      </SmallSuspenseWrapper>
      {people}
      <Button onClick={appendFn} mt={16} variant="outline">
        Add person
      </Button>
    </>
  )
}
const PersonForm = ({
  event,
  index,
  remove,
  defaultCollapsed,
  peopleSchema,
}: {
  event: TEvent
  index: number
  remove: UseFieldArrayRemove
  defaultCollapsed: boolean
  peopleSchema: z.ZodSchema<TPerson>
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  if (collapsed) {
    return <CollapsedPersonForm index={index} setCollapsed={setCollapsed} peopleSchema={peopleSchema} />
  } else {
    return <ExpandedPersonForm event={event} index={index} remove={remove} setCollapsed={setCollapsed} />
  }
}

const CollapsedPersonForm = ({ index, setCollapsed, peopleSchema }: { index: number; setCollapsed: (collapsed: boolean) => void; peopleSchema: z.ZodSchema<TPerson> }) => {
  const person = useWatch<PartialBookingType, `people.${number}`>({ name: `people.${index}` })
  const valid = peopleSchema.safeParse(person).success
  if (!person) return null
  return (
    <Paper shadow="md" radius="md" withBorder mt={16} id={person.personId} onClick={() => setCollapsed(false)} pl={8}>
      <Flex justify="flex-end" m={8} align="center">
        <Title order={3} size="h4" style={{ cursor: 'pointer', flexGrow: 1 }}>
          {valid ? '✅' : '❌'} {person.basic?.name}
        </Title>
        <ActionIcon variant="default" size="input-sm" onClick={() => setCollapsed(true)} ml={8}>
          <IconChevronDown size={16} stroke={3} />
        </ActionIcon>
      </Flex>
    </Paper>
  )
}

const ExpandedPersonForm = ({ event, index, remove, setCollapsed }: { event: TEvent; index: number; remove: UseFieldArrayRemove; setCollapsed: (collapsed: boolean) => void }) => {
  const personId = useWatch<PartialBookingType, `people.${number}.personId`>({ name: `people.${index}.personId` })
  const { register, formState } = useFormContext<z.infer<typeof BookingSchemaForType>>()

  const { errors } = formState
  const e = errorProps(errors)

  const removeFn = (index: number) => {
    if (confirm(`Are you sure you want to remove this person?`)) {
      remove(index)
    }
  }
  const emailAndDiet = event.allParticipantEmails ? (
    <>
      <Grid.Col span={8}>
        <TextInput
          required
          autoComplete={`section-person-${index} email`}
          id={`person-email-${index}`}
          data-form-type="other"
          label="Email"
          {...register(`people.${index}.basic.email` as const)}
          {...e(`people.${index}.basic.email`)}
        />
      </Grid.Col>
      <Grid.Col span={4}>
        <CustomSelect required label="Diet" id={`person-diet-${index}`} name={`people.${index}.kp.diet`} data={KPBasicOptions.map((d) => ({ value: d, label: d }))} />
      </Grid.Col>
    </>
  ) : (
    <>
      <Grid.Col span={12}>
        <CustomSelect required label="Diet" id={`person-diet-${index}`} name={`people.${index}.kp.diet`} data={KPBasicOptions.map((d) => ({ value: d, label: d }))} />
      </Grid.Col>
    </>
  )

  return (
    <Paper shadow="md" radius="md" withBorder mt={16} pl={8} pr={8} id={personId}>
      <Grid p={6} gutter={8}>
        <Grid.Col span={8}>
          <TextInput
            required
            autoComplete={`section-person-${index} name`}
            id={`person-name-${index}`}
            data-form-type="other"
            label="Name"
            {...register(`people.${index}.basic.name` as const)}
            {...e(`people.${index}.basic.name`)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <CustomDatePicker label="Date of Birth" id={`person-dob-${index}`} name={`people.${index}.basic.dob`} required />
        </Grid.Col>
        {emailAndDiet}
        <Grid.Col span={12}>
          <Textarea
            autoComplete={`section-person-${index} diet-details`}
            id={`person-details-${index}`}
            data-form-type="other"
            label="Additional dietary requirement or food related allergies"
            {...register(`people.${index}.kp.details` as const)}
            {...e(`people.${index}.kp.details`)}
            autosize
            minRows={2}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Textarea
            autoComplete={`section-person-${index} health-medical`}
            id={`person-health-medical-${index}`}
            data-form-type="other"
            label="Details of relevant medical conditions, medication taken or addtional needs"
            {...register(`people.${index}.health.medical` as const)}
            {...e(`people.${index}.health.medical`)}
            autosize
            minRows={2}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Flex justify="flex-end">
            <ActionIcon variant="default" size="input-sm" onClick={() => removeFn(index)}>
              <IconX size={16} stroke={3} color="red" />
            </ActionIcon>
            <ActionIcon variant="default" size="input-sm" onClick={() => setCollapsed(true)} ml={8}>
              <IconChevronUp size={16} stroke={3} />
            </ActionIcon>
          </Flex>
        </Grid.Col>
      </Grid>
    </Paper>
  )
}

/* const COLLAPSE_DEFAULT_THRESHOLD = 20

export function ParticipantsForm({ event, attendanceConfig, basic, participants, update, kp, consent, validation, own, readOnly = false }: { event: JsonEventType, attendanceConfig: AttendanceStructure, basic: JsonBookingType["basic"], participants: Array<PartialDeep<JsonParticipantType>>, update: any, kp: KpStructure, consent: ConsentStructure, validation: Validation, own: boolean, readOnly: boolean }) {

    const { addEmptyObjectToArray, updateArrayItem, deleteArrayItem } = getMemoUpdateFunctions(update('participants'))

    const deleteParticipant = React.useCallback((i, name) => e => {
        if (confirm(`Are you sure you want to remove ${name || ''}?`)) {
            deleteArrayItem(i)
        }
        e.preventDefault()
    }, [])

    const [incomingParticipants, setIncomingParticipants] = useState(0)
    const defaultCollapse = Math.max(participants.length, incomingParticipants) > COLLAPSE_DEFAULT_THRESHOLD

    const participantsList = participants.map((p, i) => (<MemoParticipantForm key={i} index={i} event={event} attendanceConfig={attendanceConfig} participant={p} kp={kp} consent={consent} updateArrayItem={updateArrayItem} deleteParticipant={deleteParticipant} defaultCollapse={defaultCollapse} validation={validation} readOnly={readOnly}/>))

    return <Grid container spacing={0} sx={{ mt: 2 }}>
        <Grid xs={12} p={0} item>
            <Typography variant="h6">Campers</Typography>
            {event.bigCampMode && own ? <SuspenseElement><SheetsWidget event={event} update={update} basic={basic} setIncomingParticipants={setIncomingParticipants} readOnly={readOnly}/></SuspenseElement> : null}
            {participantsList}
            <Button sx={{ mt: 2 }} variant="contained" onClick={addEmptyObjectToArray} disabled={readOnly}>
                Add person
            </Button>
        </Grid>
    </Grid>
}

function ParticipantForm({ index,
    event,
    attendanceConfig,
    participant,
    kp,
    consent,
    updateArrayItem,
    deleteParticipant,
    defaultCollapse = false,
    validation,
    readOnly }:  
    {
        index: number,
        event: JsonEventType,
        attendanceConfig: AttendanceStructure,
        participant: PartialDeep<JsonParticipantType>,
        kp: KpStructure,
        consent: ConsentStructure,
        updateArrayItem: any,
        deleteParticipant: any,
        defaultCollapse: boolean,
        validation: Validation,
        readOnly: boolean
    }) {

    const { updateSubField } = getMemoUpdateFunctions(updateArrayItem(index))
    const basicUpdates = getMemoUpdateFunctions(updateSubField('basic'))
    const updateSwitch = getMemoUpdateFunctions(updateSubField('medical')).updateSwitch

    const [deleteLock, setDeleteLock] = useState(true)
    const [collapse, setCollapse] = useState(defaultCollapse)


    if (collapse) {
        const valid = validation.validateParticipant(participant, index).length == 0
        return <Paper variant="outlined" sx={{ mt: 2, cursor: '' }} id={`P${index}`} onClick={e => setCollapse(false)}>
            <Box p={2} display="flex"
                alignItems="center">
                <Stack direction="row" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
                    {valid ? <CheckCircleOutline color="success" sx={{ verticalAlign: "middle" }} /> : <WarningAmber color="warning" sx={{ verticalAlign: "middle" }} />}
                    <Typography variant="h6" sx={{ flexGrow: 1, pr: 2, }}>{participant.basic?.name}</Typography>
                </Stack>
                <IconButton><ExpandMore /></IconButton>
            </Box>
        </Paper>
    }

    let emailAndOptionsAttendance

    if (event.attendanceStructure == "options") {
        if (event.allParticipantEmails) {
            emailAndOptionsAttendance = <>
                <Grid sm={8} xs={12} item>
                    <MemoEmailField index={index} email={participant.basic?.email} event={event} dob={participant.basic?.dob} update={basicUpdates} readOnly={readOnly}/>
                </Grid>
                <Grid sm={4} xs={12} item>
                    <attendanceConfig.ParticipantElement configuration={event.attendanceData} data={participant.attendance} update={updateSubField} readOnly={readOnly}/>
                </Grid>
            </>
        } else {
            emailAndOptionsAttendance = <Grid xs={12} item>
                <attendanceConfig.ParticipantElement configuration={event.attendanceData} data={participant.attendance} update={updateSubField} readOnly={readOnly}/>
            </Grid>
        }
    } else {
        if (event.allParticipantEmails) {
            emailAndOptionsAttendance = <Grid xs={12} item>
                <MemoEmailField index={index} email={participant.basic?.email} event={event} dob={participant.basic?.dob} update={basicUpdates} readOnly={readOnly}/>
            </Grid>
        } else {
            emailAndOptionsAttendance = null
        }
    }

    const dob = participant.basic?.dob

    return <Paper elevation={3} sx={{ mt: 2 }} id={`P${index}`}>
        <Box p={2}>
            <Grid container spacing={2}>
                <Grid sm={8} xs={12} item>
                    <TextField
                        autoComplete={`section-${index}-participant name`}
                        inputProps={{ 'data-form-type': 'other' }}
                        fullWidth
                        required
                        name={`${index}-participant-name`}
                        id={`${index}-participant-name`}
                        label="Name"
                        value={participant.basic?.name || ''}
                        onChange={basicUpdates.updateField('name')}
                        disabled={readOnly}/>
                </Grid>
                <Grid sm={4} xs={12} item>
                    <UtcDatePicker
                        label="DoB *"
                        value={participant.basic?.dob}
                        onChange={basicUpdates.updateDate('dob')}
                        slotProps={{ field: { autoComplete: "off" } }}
                        disabled={readOnly}
                    />
                </Grid>
                {emailAndOptionsAttendance}
                <Grid xs={12} item>
                    <Divider >Diet</Divider>
                    <kp.ParticipantFormElement index={index} data={participant.kp || {}} update={updateSubField('kp')} readOnly={readOnly}/>
                </Grid>
                <Grid xs={12} item>
                    <Divider>Medical & Accessbility</Divider>
                    <ParicipantMedicalForm index={index} event={event} data={participant.medical || {}} update={updateSubField('medical')} readOnly={readOnly}/>
                </Grid>
                <Grid xs={12} item>
                    <Divider>Consent</Divider>
                    <consent.ParticipantFormElement event={event} data={participant.consent || {}} basic={participant.basic || {}} update={updateSubField('consent')} readOnly={readOnly}/>
                </Grid>
                {event.bigCampMode && dob && differenceInYears(parseDate(event.startDate)!, parseDate(dob)!) >= 18 ? <Grid xs={12} item>
                    <FormControlLabel checked={participant.medical?.firstAid || false} onChange={updateSwitch('firstAid')} control={<Checkbox />} label="First Aider (18+ only)" disabled={readOnly}/>
                </Grid>
                    : null}
                {/*}Grid xs={12} item>
                    <FormControlLabel control={<Switch checked={participant.consent?.photo as boolean || false} onChange={getMemoUpdateFunctions(updateSubField('consent')).updateSwitch('photo')} />} label="Photo Consent" />
</Grid>*/ /*}
                <Grid xs={12} item>
                    <Box display="flex" justifyContent="flex-end">
                        <IconButton onClick={() => setCollapse(true)}><ExpandLess /></IconButton>
                        <IconButton color="warning" onClick={e => setDeleteLock(d => !d)}>{deleteLock ? <Lock /> : <LockOpen />}</IconButton>
                        <IconButton color="error" disabled={deleteLock} onClick={deleteParticipant(index, participant.basic?.name)}><Close /></IconButton>
                    </Box>
                </Grid>
            </Grid>
        </Box >
    </Paper >
}

const MemoParticipantForm = React.memo(ParticipantForm)

function ParicipantMedicalForm({ index, event, data, update, readOnly }: { index: number, event: JsonEventType, data: PartialDeep<JsonParticipantType>["medical"], update: any, readOnly: boolean }) {

    const { updateField, updateSwitch } = getMemoUpdateFunctions(update)

    if (!event.bigCampMode) {
        return <>
            <TextField
                autoComplete={`section-${index}-participant medical`}
                sx={{ mt: 2 }}
                multiline
                fullWidth
                minRows={2}
                name={`${index}-participant-medical`}
                id={`${index}-participant-medical`}
                inputProps={{ 'data-form-type': 'other' }}
                label="Please provide us with details of medical conditions, medication or additional needs:"
                value={data?.details || ''}
                onChange={updateField('details')}
                InputProps={event.bigCampMode ? {
                    endAdornment: <InputAdornment position="end">
                        <Tooltip title={`LONG WORDAGE HERE`}>
                            <IconButton
                                aria-label="help tooltip"
                                edge="end"
                            >
                                <HelpOutline />
                            </IconButton>
                        </Tooltip>
                    </InputAdornment>,
                    sx: { alignItems: "flex-start" }
                } : {}}
                disabled={readOnly}
            />
        </>
    } else {
        return <>
            <TextField
                autoComplete={`section-${index}-participant medical`}
                sx={{ mt: 2 }}
                multiline
                fullWidth
                minRows={2}
                name={`${index}-participant-medical`}
                id={`${index}-participant-medical`}
                inputProps={{ 'data-form-type': 'other' }}
                label="Medical conditions, medication or additional needs:"
                value={data?.details || ''}
                onChange={updateField('details')}
                disabled={readOnly}
            />
            <Typography variant="body2" sx={{ mt: 2 }}>Please provide us with details of any accessibility requirements, this may include mobility issues, a requirement for power or other access requirements</Typography>
            <TextField
                autoComplete={`section-${index}-participant accessibility`}
                sx={{ mt: 2 }}
                multiline
                fullWidth
                minRows={2}
                name={`${index}-participant-accessibility`}
                id={`${index}-participant-accessibility`}
                inputProps={{ 'data-form-type': 'other' }}
                label="Accessibility requirements:"
                value={data?.accessibility || ''}
                onChange={updateField('accessibility')}
                InputProps={event.bigCampMode ? {
                    endAdornment: <InputAdornment position="end">
                        <Tooltip title={`This is so we can best support all campers throughout Camp 100`}>
                            <IconButton
                                aria-label="help tooltip"
                                edge="end"
                            >
                                <HelpOutline />
                            </IconButton>
                        </Tooltip>
                    </InputAdornment>,
                    sx: { alignItems: "flex-start" }
                } : {}}
                disabled={readOnly}
            />
            <FormControlLabel checked={data?.contactMe || false} onChange={updateSwitch('contactMe')} control={<Checkbox />} label="I would like to talk to the accessibility team about my accessibility requirements" disabled={readOnly}/>
        </>
    }
}

const EmailField = ({ index, email, dob, event, update, readOnly }: { index: number, email: Partial<Required<JsonParticipantType>["basic"]>["email"], dob: string | undefined, event: JsonEventType, update: any, readOnly: boolean }) => {
    const inputProps = {
        endAdornment: <InputAdornment position="end">
            <Tooltip title={`We will use this email address to contact campers with updates about camp and verify Woodcraft Folk membership.`}>
                <IconButton
                    aria-label="toggle password visibility"
                    edge="end"
                >
                    <HelpOutline />
                </IconButton>
            </Tooltip>
        </InputAdornment>,
    }

    if (dob && differenceInYears(parseDate(event.startDate)!, parseDate(dob)!) < 16) {
        return <TextField
            autoComplete={`section-${index}-participant email`}
            fullWidth
            required
            name={`${index}-participant-email`}
            id={`${index}-participant-email`}
            inputProps={{ 'data-form-type': 'other' }}
            type="email"
            label="Parent/Guardian email"
            value={email || ''}
            onChange={update.updateField('email')}
            InputProps={inputProps} 
            disabled={readOnly}/>
    } else {
        return <TextField
            autoComplete={`section-${index}-participant email`}
            fullWidth
            required
            name={`${index}-participant-email`}
            id={`${index}-participant-email`}
            inputProps={{ 'data-form-type': 'other' }}
            type="email"
            label="Email"
            value={email || ''}
            onChange={update.updateField('email')}
            InputProps={inputProps} 
            disabled={readOnly}/>
    }
}

const MemoEmailField = React.memo(EmailField) */
