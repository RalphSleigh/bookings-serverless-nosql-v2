import { subject } from '@casl/ability'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { ManageWrapper } from '../../../../components/manage/manageWrapper'

export const Route = createFileRoute('/_user/event/$eventId/manage')({
    beforeLoad: async ({ location, context, params }) => {
        if(context.permission.can('getBackend', subject('eventId', { eventId: params.eventId })) === false)
          throw redirect({
            to: '/',
          })
      },
  component: ManageWrapper,
})
