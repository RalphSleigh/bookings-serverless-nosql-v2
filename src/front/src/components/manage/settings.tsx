import { Switch, Title } from '@mantine/core'
import { useParams, useRouteContext } from '@tanstack/react-router'
import { use } from 'react'

import { updateUserNopeList } from '../../mutations/updateUserEmailNopeList'
import { useEvent } from '../../utils'

export const ManageSettings = () => {
  const { user } = useRouteContext({ from: '/_user' })
  const event = useEvent()
  const { eventId } = event

  const eventIdInNopeList = user.preferences.emailNopeList.find((e) => e === eventId) !== undefined

  const mutation = updateUserNopeList(eventId)

  return (
    <>
      <Title order={2} mt={16} mb={16}>
        Settings
      </Title>
      <Switch disabled={mutation.isPending} checked={!eventIdInNopeList} onChange={(e) => mutation.mutate(!eventIdInNopeList)} label="Send me management emails about this event" />
    </>
  )
}
