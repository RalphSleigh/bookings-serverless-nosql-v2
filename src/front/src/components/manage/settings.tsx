import { Switch, Title } from '@mantine/core'
import { useParams, useRouteContext } from '@tanstack/react-router'
import { use } from 'react'

import { updateUserPreference } from '../../mutations/updateUserPreference'
import { useEvent } from '../../utils'

export const ManageSettings = () => {
  const { user } = useRouteContext({ from: '/_user' })
  const event = useEvent()
  const { eventId } = event

  const eventIdInNopeList = user.preferences.emailNopeList.find((e) => e === eventId) !== undefined
  const nopeMutation = updateUserPreference('emailNopeList', eventId)

  const eventIdInDriveSyncList = user.preferences.driveSyncList.find((e) => e === eventId) !== undefined
  const driveSyncMutation = updateUserPreference('driveSync', eventId)
  return (
    <>
      <Title order={2} mt={16} mb={16}>
        Settings
      </Title>
      <Switch disabled={nopeMutation.isPending} checked={!eventIdInNopeList} onChange={(e) => nopeMutation.mutate(!eventIdInNopeList)} label="Send me management emails about this event" />
      <Switch
        disabled={driveSyncMutation.isPending || !user.isWoodcraft}
        checked={eventIdInDriveSyncList}
        onChange={(e) => driveSyncMutation.mutate(!eventIdInDriveSyncList)}
        label="Sync booking data to my Google Drive"
        mt={8}
      />
    </>
  )
}
