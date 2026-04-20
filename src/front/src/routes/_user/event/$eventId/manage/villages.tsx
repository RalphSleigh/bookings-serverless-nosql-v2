import { subject } from '@casl/ability'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { ManageVillages } from '../../../../../components/manage/villages'

//import { useSuspenseIfUser } from '../queries/useSuspenseWrapper'

export const Route = createFileRoute('/_user/event/$eventId/manage/villages')({
  beforeLoad: async ({ params, context }) => {
    if (context.permission.can('manageVillages', subject('eventId', { eventId: params.eventId })) === false)
      throw redirect({
        to: '/',
      })
  },
  component: ManageVillages,
})
