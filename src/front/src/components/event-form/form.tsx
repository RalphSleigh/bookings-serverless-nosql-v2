import { Close } from '@mui/icons-material';
import { Box, Button, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, MenuItem, Paper, Select, Switch, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { DateTimePicker } from '@mui/x-date-pickers';
import { parseISO } from 'date-fns';
import React, { Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';
import { PartialDeep } from 'type-fest';

import { AttendanceOptions } from '../../../../shared/attendance/attendance.js';
import { ConsentsOptions } from '../../../../shared/consents/consents.js';
import { getFeeTypesForEvent, maybeGetFeeType } from '../../../../shared/fees/fees.js';
import { KPOptions } from '../../../../shared/kp/kp.js';
import { EventSchemaWhenCreating, TCustomQuestion, TEventSchemaWhenCreating } from '../../../../shared/schemas/event.js';
import { getArrayUpdate, getMemoArrayUpdateFunctions, getMemoObjectUpdateFunctions, getSubUpdate } from '../../utils.js';
import { UtcDatePicker } from '../utcDatePicker.js';
import { UseMutationResult } from '@tanstack/react-query';

type PartialEventType = PartialDeep<TEventSchemaWhenCreating>;

export function EventForm({ inputData, mode, mutation }: { inputData: PartialEventType; mode: 'create' | 'edit', mutation: UseMutationResult<any, any, any, any> }) {
  const [data, setData] = useState(inputData);

  //const { events } = useEvents().data

  const { updateField, updateDate, updateSwitch } = getMemoObjectUpdateFunctions(setData);

  const updateKP = getMemoObjectUpdateFunctions(getSubUpdate(setData, 'kp'));
  const updateConsents = getMemoObjectUpdateFunctions(getSubUpdate(setData, 'consents'));
  const updateAttendance = getMemoObjectUpdateFunctions(getSubUpdate(setData, 'attendance'));
  const updateFeeFunction = getSubUpdate(setData, 'fee')
  const updateFee = getMemoObjectUpdateFunctions(updateFeeFunction);
  const updateCustomQuestions = getArrayUpdate(setData, 'customQuestions');

  const valid = EventSchemaWhenCreating.safeParse(data);

  const create = (e: React.MouseEvent<HTMLElement>) => {
        mutation.mutate(data)
        e.preventDefault()
  }

  const kpOptions = KPOptions.map((k) => (
    <MenuItem key={k} value={k}>
      {k}
    </MenuItem>
  ));

  const consentOptions = ConsentsOptions.map((k) => (
    <MenuItem key={k} value={k}>
      {k}
    </MenuItem>
  ));

  const attendanceOptions = AttendanceOptions.map((k) => (
    <MenuItem key={k} value={k}>
      {k}
    </MenuItem>
  ));

  // const Attendance = maybeGetAttendance(data)
  // const AttendanceConfig = Attendance?.ConfigurationElement ?? (() => <></>)

  const feeOptions = getFeeTypesForEvent(data).map((k) => (
    <MenuItem key={k.typeName} value={k.typeName}>
      {k.name}
    </MenuItem>
  ));

  const feeConfig = React.useMemo(() => maybeGetFeeType(data), [data.fee?.feeStructure]);

  /*     const feeOptions = Object.entries(fees).filter(([key, value]) => value.enabledForAttendance(Attendance)).map(([key, value]) => <MenuItem key={key} value={key}>
        {value.feeName}
    </MenuItem>) */

  /*     const Fees = maybeGetFee(data)
    const FeeConfig = Fees?.ConfigurationElement ?? (() => <></>) */

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
  return (
    <Grid container spacing={0}>
      <Grid size={12} p={2}>
        <Paper elevation={3}>
          <Box p={2}>
            <form>
              <Grid container spacing={0}>
                <Typography variant="h4">{mode == 'create' ? 'New Event' : `Editing - ${data.name}`}</Typography>
                <Grid size={12}>
                  {/* <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="event-select-label">Copy From</InputLabel>
                    <Select label="Copy From" onChange={copyFromEvent} labelId="event-select-label">
                      <MenuItem key="default" value="default">
                        Please select
                      </MenuItem>
                      {eventsToCopyFrom}
                    </Select>
                  </FormControl> */}
                  <TextField fullWidth sx={{ mt: 2 }} required id="outlined-required" label="Name" value={data.name || ''} onChange={updateField('name')} />
                  <TextField fullWidth sx={{ mt: 2 }} multiline minRows={3} id="outlined-required" label="Description" value={data.description || ''} onChange={updateField('description')} />
                  <FormGroup>
                    <UtcDatePicker sx={{ mt: 2 }} label="Start Date" value={data.startDate} onChange={updateDate('startDate')} />
                  </FormGroup>
                  <FormGroup>
                    <UtcDatePicker sx={{ mt: 2 }} label="End Date" value={data.endDate} onChange={updateDate('endDate')} />
                  </FormGroup>
                  <FormGroup>
                    <DateTimePicker sx={{ mt: 2 }} label="Booking Deadline" timezone="UTC" value={parseISO(data.bookingDeadline || '')} onChange={updateDate('bookingDeadline')} />
                  </FormGroup>
                  <TextField
                    fullWidth
                    sx={{ mt: 2 }}
                    required
                    type="email"
                    id="outlined-required"
                    label="Email subject tag"
                    value={data.emailSubjectTag || ''}
                    onChange={updateField('emailSubjectTag')}
                  />
                  <TextField fullWidth sx={{ mt: 2 }} required type="email" id="outlined-required" label="Reply-to" value={data.replyTo || ''} onChange={updateField('replyTo')} />
                  <FormGroup>
                    <FormControlLabel sx={{ mt: 2 }} control={<Switch checked={data.bigCampMode || false} onChange={updateSwitch('bigCampMode')} />} label="Big Camp Mode" />
                  </FormGroup>
                  <FormGroup>
                    <FormControlLabel sx={{ mt: 2 }} control={<Switch checked={data.applicationsRequired || false} onChange={updateSwitch('applicationsRequired')} />} label="Applications required?" />
                  </FormGroup>
                  <FormGroup>
                    <FormControlLabel sx={{ mt: 2 }} control={<Switch checked={data.allParticipantEmails || false} onChange={updateSwitch('allParticipantEmails')} />} label="All participant emails" />
                  </FormGroup>
                  <FormGroup>
                    <FormControlLabel sx={{ mt: 2 }} control={<Switch checked={data.howDidYouHear || false} onChange={updateSwitch('howDidYouHear')} />} label="How did you hear question" />
                  </FormGroup>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="kp-select-label">KP Structure</InputLabel>
                    <Select value={data.kp?.kpStructure || 'default'} label="KP  Structure" onChange={updateKP.updateField('kpStructure')} labelId="kp-select-label">
                      {data.kp?.kpStructure ? null : (
                        <MenuItem key="default" value="default">
                          Please select
                        </MenuItem>
                      )}
                      {kpOptions}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="consent-select-label">Consent Structure</InputLabel>
                    <Select value={data.consents?.consentsStructure || 'default'} label="Consent Structure" onChange={updateConsents.updateField('consentsStructure')} labelId="consent-select-label">
                      {data.consents?.consentsStructure ? null : (
                        <MenuItem key="default" value="default">
                          Please select
                        </MenuItem>
                      )}
                      {consentOptions}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="attendance-select-label">Attendance Structure</InputLabel>
                    <Select
                      value={data.attendance?.attendanceStructure || 'default'}
                      label="Attendance Structure"
                      onChange={updateAttendance.updateField('attendanceStructure')}
                      labelId="attendance-select-label"
                    >
                      {data.attendance?.attendanceStructure ? null : (
                        <MenuItem key="default" value="default">
                          Please select
                        </MenuItem>
                      )}
                      {attendanceOptions}
                    </Select>
                  </FormControl>
                  {/* <AttendanceConfig data={data.attendanceData} update={updateSubField('attendanceData')} /> */}
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="fee-select-label">Fee Structure</InputLabel>
                    <Select
                      disabled={!data.attendance?.attendanceStructure}
                      value={data.fee?.feeStructure || 'default'}
                      label="Fee Structure"
                      onChange={updateFee.updateField('feeStructure')}
                      labelId="fee-select-label"
                    >
                      {data.fee?.feeStructure ? null : (
                        <MenuItem key="default" value="default">
                          Please select
                        </MenuItem>
                      )}
                      {feeOptions}
                    </Select>
                  </FormControl>
                  { feeConfig ? <feeConfig.ConfigurationElement data={data.fee as never} update={updateFeeFunction} /> : null }
                  {/* <FeeConfig attendanceData={data.attendanceData} data={data.feeData ?? {}} update={updateSubField('feeData')} /> */}
                  <CustomQuestionsForm data={data.customQuestions} update={updateCustomQuestions} />
                </Grid>
                <Grid container spacing={0}>
                  <Button disabled={!valid.success || mutation.isPending} sx={{ mt: 2 }} variant="contained" onClick={create}>
                    {mode == 'create' ? 'Create' : 'Edit'}
                  </Button>
                  {JSON.stringify(valid)}
                </Grid>
              </Grid>
            </form>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

function CustomQuestionsForm({ data = [], update }: { data: PartialEventType['customQuestions']; update: Dispatch<SetStateAction<TEventSchemaWhenCreating['customQuestions']>> }) {
  const { updateItem, deleteItem} = getMemoArrayUpdateFunctions(update)
  

  const deleteQuestion = useCallback(
    (i: number) => (e: { preventDefault: () => void; }) => {
      deleteItem(i);
      e.preventDefault();
    },
    [],
  );

  const questions = [...data, {}].map((q, i) => {
    return <QuestionItem i={i} key={i} question={q} updateItem={updateItem(i)} deleteQuestion={deleteQuestion(i)} />;
  });

  return (
    <>
      <Typography sx={{ mt: 2 }} variant="h5">
        Custom Questions
      </Typography>
      {questions}
{/*       <FormControl sx={{ mt: 2 }}>
        <Button variant="contained" onClick={addEmptyObjectToArray}>
          Add Question
        </Button>
      </FormControl> */}
    </>
  );
}

const QuestionItem = ({ i, question, updateItem, deleteQuestion }: { i: number; question: Partial<TCustomQuestion>; updateItem: Dispatch<SetStateAction<TCustomQuestion>>; deleteQuestion: any }) => {
  const { updateField } = getMemoObjectUpdateFunctions(updateItem);

  return (
    <Paper elevation={6} sx={{ mt: 2 }}>
      <Box key={i} p={2}>
        <FormControl sx={{ mt: 2 }}>
          <InputLabel id={`question-select-label-${i}`}>Type</InputLabel>
          <Select value={question.questionType || 'default'} label="Question type" onChange={updateField('questionType')} labelId={`question-select-label-${i}`}>
            <MenuItem value="default">Please select</MenuItem>
            <MenuItem value="yesnochoice">Yes/No</MenuItem>
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="longtext">Long Text</MenuItem>
          </Select>
        </FormControl>
        <IconButton color="error" onClick={deleteQuestion}>
          <Close />
        </IconButton>
        <TextField fullWidth sx={{ mt: 2 }} required id="outlined-required" label="Label" value={question.questionLabel || ''} onChange={updateField('questionLabel')} />
      </Box>
    </Paper>
  );
};
