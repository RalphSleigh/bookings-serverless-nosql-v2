import { drive_v3 } from '@googleapis/drive'
import { Button, Flex, Paper, Text, Title } from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { MouseEventHandler, useContext, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import z from 'zod/v4'

import { BookingSchemaForTypeBasicBig, TBookingSchemaForTypeBasicBig, TBookingSchemaForTypeBasicBigGroup } from '../../../../shared/schemas/booking'
import { TEvent } from '../../../../shared/schemas/event'
import { createSheetForBooking } from '../../mutations/createSheetForBooking'
import { getCampersFromSheetMutation } from '../../mutations/getCampersFromSheet'
import { getDoesBookingHaveSpreadsheet } from '../../queries/getDoesBookingHaveSpreadsheet'

export const SheetsInput: React.FC<{ event: TEvent; userId: string }> = ({ event, userId }) => {
  const basic = useWatch<TBookingSchemaForTypeBasicBig, 'basic'>({ name: 'basic' })
  if (basic?.type !== 'group') return null
  if (!event.bigCampMode) return null
  return <SheetsDecider event={event} userId={userId} />
}

const SheetsDecider: React.FC<{ event: TEvent; userId: string }> = ({ event, userId }) => {
  const hasSheetsQuery = useSuspenseQuery(getDoesBookingHaveSpreadsheet(event.eventId, userId))

  if (hasSheetsQuery.data.sheet) {
    return <SheetBoxHasSheets sheet={hasSheetsQuery.data.sheet} event={event} userId={userId} />
  } else {
    return <SheetBoxNoSheets event={event} />
  }
}

const SheetBoxNoSheets: React.FC<{ event: TEvent }> = ({ event }) => {
  const userId = useWatch<TBookingSchemaForTypeBasicBigGroup, 'userId'>({ name: 'userId' })
  const createSheet = createSheetForBooking(event.eventId)

  const basic = useWatch<TBookingSchemaForTypeBasicBigGroup, 'basic'>({ name: 'basic' })

  const notGotNeededData = !basic?.name || !basic?.email || !basic?.district

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
        <Flex mt={8} justify="flex-end">
          <Button
            loading={createSheet.isPending}
            gradient={{ from: 'cyan', to: 'green', deg: 110 }}
            variant="gradient"
            onClick={() => createSheet.mutate({ userId, name: basic.name, email: basic.email, district: basic.district })}
          >
            Create Sheet
          </Button>
        </Flex>
      )}
    </Paper>
  )
}

const SheetBoxHasSheets: React.FC<{ sheet: drive_v3.Schema$File; event: TEvent; userId: string }> = ({ sheet, event, userId }) => {
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
    getPeopleMutation.mutate({ eventId: event.eventId, userId: userId })
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
      {getPeopleMutation.isPending && <Text ml={8}>Loading...</Text>}
      {getPeopleMutation.isSuccess && (
        <Text ml={8}>
          Data Imported, please resolve any validation issues and then <b>submit the form.</b>
        </Text>
      )}
      <Flex mt={8} justify="flex-end">
        <Button gradient={{ from: 'cyan', to: 'green', deg: 110 }} loading={getPeopleMutation.isPending} variant="gradient" onClick={updatePeopleFromSheet}>
          Import Campers to Form
        </Button>
      </Flex>
    </Paper>
  )
}
