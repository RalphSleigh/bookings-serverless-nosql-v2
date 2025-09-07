import { subject } from '@casl/ability'
import { ActionIcon, Flex } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, redirect, useRouteContext } from '@tanstack/react-router'

import { getUserBookingsQueryOptions } from '../../../../../queries/geUserBookings'
import { useEvent } from '../../../../../utils'
import { getEventRolesQueryOptions } from '../../../../../queries/getEventRoles'
import { getUsersQueryOptions } from '../../../../../queries/getUsers'
import { ManageRoles } from '../../../../../components/manage/roles'

//import { useSuspenseIfUser } from '../queries/useSuspenseWrapper'

export const Route = createFileRoute('/_user/event/$eventId/manage/roles')({
  beforeLoad: async ({ params, context }) => {
    if (context.permission.can('viewRoles', subject('eventId', { eventId: params.eventId })) === false)
      throw redirect({
        to: '/',
      })

      context.queryClient.prefetchQuery(getEventRolesQueryOptions(params.eventId))
      context.queryClient.prefetchQuery(getUsersQueryOptions(params.eventId))
  },
  component: ManageRoles,
})
