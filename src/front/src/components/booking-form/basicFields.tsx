import { Alert, Box, Grid, Paper, Radio, RadioGroup, Text, TextInput, Title } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import React from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'
import { z } from 'zod/v4'

import { organisations } from '../../../../shared/ifm'
import { BookingSchemaForTypeBasicBig, BookingSchemaForTypeBasicSmall, BookingSchemaForType, TBooking, PartialBookingType } from '../../../../shared/schemas/booking'
import { TEvent } from '../../../../shared/schemas/event'
import { errorProps } from '../../utils'
import { CustomSelect } from '../custom-inputs/customSelect'


import classes from '../../css/typeChooser.module.css'

const PrivateRelayWarning = () => {
  const email = useWatch<PartialBookingType, "basic.email">({ name: 'basic.email' })
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

type BasicBookingFieldsProps = {
  event: TEvent
}

export const BasicFieldsSmall: React.FC<BasicBookingFieldsProps> = ({ event }) => {
  const { register, formState } = useFormContext<z.infer<typeof BookingSchemaForTypeBasicSmall>>()

  //({ data, update, readOnly }: { data: PartialDeep<JsonBookingType>["basic"], update: any, readOnly: boolean }) {

  // const { updateField } = getMemoUpdateFunctions(update('basic'))

  const { errors } = formState

  const e = errorProps(errors)

  return (
    <>
      <Title size="h4" order={2}>{`Your details`}</Title>
      <TextInput autoComplete="name" id="name" data-form-type="name" required label="Your Name" {...register('basic.name')} {...e('basic.name')} />
      <TextInput autoComplete="email" id="email" data-form-type="email" required type="email" label="Your email" {...register('basic.email')} {...e('basic.email')} />
      <PrivateRelayWarning />
      <TextInput autoComplete="tel" id="telephone" data-form-type="phone" required type="tel" label="Phone Number" {...register('basic.telephone')} {...e('basic.telephone')} />
    </>
  )
}

export const BasicFieldsBig: React.FC<BasicBookingFieldsProps> = ({ event }) => {
  const { register, control, formState } = useFormContext<z.infer<typeof BookingSchemaForTypeBasicBig>>()

  const bookingType = useWatch<PartialBookingType, "basic.type">({ name: 'basic.type' })

  const radioController = useController({ name: 'basic.type' })

  const paperProps = (field: string) => (value: string | undefined) => {
    const props = { withBorder: true, p: 'md', style: { height: '100%', cursor: 'pointer' } }
    if (field === value) {
      return { className: classes.chooserSelected, ...props }
    } else {
      return { className: classes.chooserUnselected, ...props }
    }
  }

  const { errors } = formState

  const e = errorProps(errors)

  return (
    <>
      <Title size="h4" order={2}>{`Booking Type`}</Title>
      <Text mt={16}>Please select the type of booking you are making:</Text>
      <RadioGroup
        value={radioController.field.value}
        onChange={(value) => {
          radioController.field.onChange(value)
        }}
        name="bookingType"
        required
      >
        <Grid mt={16}>
          <Grid.Col span={6}>
            <Paper
              {...paperProps('group')(bookingType)}
              onClick={() => {
                radioController.field.onChange('group')
              }}
            >
              <Radio value="group" style={{ float: 'right' }} />
              <Text size="lg">Group Booking</Text>
              <Text> If you are booking for a Woodcraft Folk District, Group, or other large booking, please select this option.</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={6}>
            <Paper
              {...paperProps('individual')(bookingType)}
              onClick={() => {
                radioController.field.onChange('individual')
              }}
            >
              <Radio value="individual" style={{ float: 'right' }} />
              <Text size="lg">Individual Booking</Text>
              <Text> If you are booking just yourself or your family members, please select this option.</Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </RadioGroup>
      <CustomSelect name="basic.organisation" label="Organisation" control={control} data={organisations.map((o) => o[0])} required mt={16} {...e('basic.organisation')} />
      <TextInput autoComplete="district" id="district" data-form-type="other" required={bookingType === 'group'} label="District" {...register('basic.district')} {...e('basic.district')} />
      <Title size="h4" order={2} mt={16}>{`Your details`}</Title>
      <TextInput autoComplete="name" id="name" data-form-type="name" required label="Your Name" {...register('basic.name')} {...e('basic.name')} />
      <TextInput autoComplete="email" id="email" data-form-type="email" required type="email" label="Your email" {...register('basic.email')} {...e('basic.email')} />
      <PrivateRelayWarning />
      <TextInput autoComplete="tel" id="telephone" data-form-type="phone" required type="tel" label="Phone Number" {...register('basic.telephone')} {...e('basic.telephone')} />
    </>
  )
}

/* function bookingGroupContactFields({ data, update, readOnly }: { data: PartialDeep<JsonBookingType>["basic"], update: any, readOnly: boolean }) {

    const { updateField } = getMemoUpdateFunctions(update('basic'))

    const selectedStyle = { borderColor: "success.dark", backgroundColor: "success.light", color: "success.contrastText", cursor: "pointer" }
    const unselectedStyle = { borderColor: "divider.main", backgroundColor: "background.default", cursor: "pointer" }

    const groupStyle = data?.bookingType == "group" ? selectedStyle : unselectedStyle
    const individualStyle = data?.bookingType == "individual" ? selectedStyle : unselectedStyle

    const organsationItems = organisations.map((o, i) => {
        return <MenuItem key={i} value={o[0]}>
            {o[0]}
        </MenuItem>
    })

    const districtRequired = data?.bookingType == "group" && data?.organisation == "Woodcraft Folk"

    return <>
        <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="organisation-select-label">Organisation</InputLabel>
            <Select
                labelId="organisation-select-label"
                id="organisation-select"
                label="Organisation"
                value={data?.organisation || "select"}
                onChange={updateField("organisation")}
                disabled={readOnly}>
                {!data?.organisation ? <MenuItem key="select" value="select">Please select</MenuItem> : null}
                {organsationItems}
            </Select>
        </FormControl>
        <TextField autoComplete="group" name="group" id="group" inputProps={{ 'data-form-type': 'other' }} fullWidth sx={{ mt: 2 }} required={districtRequired} label="District" value={data?.district || ''} onChange={updateField('district')} disabled={readOnly} />
        <Typography variant="h6" mt={2}>{`Your details`}</Typography>
        <TextField autoComplete="name" name="name" id="name" inputProps={{ 'data-form-type': 'name' }} fullWidth sx={{ mt: 2 }} required label="Your Name" value={data?.contactName || ''} onChange={updateField('contactName')} disabled={readOnly} />
        <TextField autoComplete="email" name="email" id="email" inputProps={{ 'data-form-type': 'email' }} fullWidth sx={{ mt: 2 }} required type="email" label="Your email" value={data?.contactEmail || ''} onChange={updateField('contactEmail')} disabled={readOnly} />
        {data?.contactEmail?.includes("privaterelay.appleid.com") ? <Alert severity="warning" sx={{ mt: 2, pt: 2 }}>
            <AlertTitle>This appears to be an Apple private relay address, we recommend you provide your actual email address, otherwise we may be unable to contact you. This will not be shared outside the camp team.</AlertTitle>
        </Alert> : null}
        <TextField autoComplete="tel" name="telephone" id="telephone" inputProps={{ 'data-form-type': 'phone' }} fullWidth sx={{ mt: 2 }} required type="tel" label="Phone Number" value={data?.contactPhone || ''} onChange={updateField('contactPhone')} disabled={readOnly} />
    </>
}

const MemoBookingIndvidualContactFields = React.memo(bookingIndvidualContactFields)
const MemoBookingGroupContactFields = React.memo(bookingGroupContactFields) */
