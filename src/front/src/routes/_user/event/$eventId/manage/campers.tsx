import { ActionIcon, Flex } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, redirect, useRouteContext } from '@tanstack/react-router'

import { useEvent } from '../../../../../utils'
import { getUserBookingsQueryOptions } from '../../../../../queries/geUserBookings'
import { ManageCampers } from '../../../../../components/manage/campers'
import { subject } from '@casl/ability'

//import { useSuspenseIfUser } from '../queries/useSuspenseWrapper'

export const Route = createFileRoute('/_user/event/$eventId/manage/campers')({
   beforeLoad: async ({ params, context }) => {
    if (context.permission.can('getBackend', subject('eventId', { eventId: params.eventId })) === false)
      throw redirect({
        to: '/',
      })
  },
  component: ManageCampers,
})