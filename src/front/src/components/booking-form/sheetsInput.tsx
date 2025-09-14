import { drive_v3 } from '@googleapis/drive'
import { Button, Paper, Text, Title } from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { MouseEventHandler, useContext, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import z from 'zod/v4'

import { BookingSchemaForType, BookingSchemaForTypeBasicBig, TBasicBig } from '../../../../shared/schemas/booking'
import { TEvent } from '../../../../shared/schemas/event'
import { TUser } from '../../../../shared/schemas/user'
import { createSheetForBooking } from '../../mutations/createSheetForBooking'
import { getCampersFromSheetMutation } from '../../mutations/getCampersFromSheet'
import { getDoesBookingHaveSpreadsheet } from '../../queries/getDoesBookingHaveSpreadsheet'

export const SheetsInput: React.FC<{ event: TEvent }> = ({ event }) => {
  if (!event.bigCampMode) return null

  const { permission, user } = useRouteContext({ from: '/_user' })
  const hasSheetsQuery = useSuspenseQuery(getDoesBookingHaveSpreadsheet(event.eventId, user.userId))

  if (hasSheetsQuery.data.sheet) {
    return <SheetBoxHasSheets sheet={hasSheetsQuery.data.sheet} event={event} user={user} />
  } else {
    return <SheetBoxNoSheets event={event} />
  }
}

const SheetBoxNoSheets: React.FC<{ event: TEvent }> = ({ event }) => {
  const { watch } = useFormContext<z.infer<typeof BookingSchemaForTypeBasicBig>>()
  const basic = watch('basic')
  const userId = watch('userId')
  const createSheet = createSheetForBooking(event.eventId)

  if (basic.type !== 'group') return null

  const notGotNeededData = !basic.name || !basic.email || !basic.district

  return (
    <Paper mt={8} bd="1 solid green" bg="green.0" c="green.9" p={8} style={{ bd: '1 solid green', bg: 'green.0', c: 'green.9' }}>
      <Title order={3} size="h4" ml={8}>
        Spreadsheet Input
      </Title>
      <Text ml={8} mt={8}>
        Rather than filling in the form below with details of your campers, we can create you a Google Sheet to fill in and then import the data. This may be easier for larger groups. Clicking the
        button below will create a Google Sheet and share it with the email you have provided:
        <br />
        <b>{basic.email}</b>
      </Text>
      {notGotNeededData ? (
        <Text ml={8} mt={8}>
          Please fill in your name, email and district to use this feature.
        </Text>
      ) : (
        <Button onClick={() => createSheet.mutate({ userId, name: basic.name, email: basic.email, district: basic.district })}>Create Sheet</Button>
      )}
    </Paper>
  )
}

const SheetBoxHasSheets: React.FC<{ sheet: drive_v3.Schema$File; event: TEvent; user: TUser }> = ({ sheet, event, user }) => {
  const getPeopleMutation = getCampersFromSheetMutation()

  const { setValue } = useFormContext<z.infer<typeof BookingSchemaForTypeBasicBig>>()

  useEffect(() => {
    if (getPeopleMutation.isSuccess) {
      console.log('Got people from sheet:', getPeopleMutation.data)
      setValue('people', getPeopleMutation.data.people, { shouldDirty: true })
    }
  }, [getPeopleMutation.isSuccess, getPeopleMutation.data])

    const updatePeopleFromSheet: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    getPeopleMutation.mutate({ eventId: event.eventId, userId: user.userId })
  }


  return (
    <Paper mt={8} bd="1 solid green" bg="green.0" c="green.9" p={8} style={{ bd: '1 solid green', bg: 'green.0', c: 'green.9' }}>
      <Title order={3} size="h4" ml={8}>
        Spreadsheet Input
      </Title>
      <Text ml={8} mt={8}>
        Your sheet has been created and shared with your account. You can access it{' '}
        <a href={sheet.webViewLink!} target="_blank">
          here
        </a>
        .<br />
        Once you have filled it in, please click the button below to import your campers to the form. This will overwrite any existing data you have entered.
      </Text>
      <Button onClick={updatePeopleFromSheet}>Update People</Button>
    </Paper>
  )
}
