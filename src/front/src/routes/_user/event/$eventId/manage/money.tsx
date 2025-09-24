import { subject } from '@casl/ability'
import { ActionIcon, Flex } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, redirect, useRouteContext } from '@tanstack/react-router'

import { ManageMoney } from '../../../../../components/manage/money'
import { getEventFeesQueryOptions } from '../../../../../queries/getEventFees'

//import { useSuspenseIfUser } from '../queries/useSuspenseWrapper'

export const Route = createFileRoute('/_user/event/$eventId/manage/money')({
  beforeLoad: async ({ params, context }) => {
    if (context.permission.can('getFees', subject('eventId', { eventId: params.eventId })) === false)
      throw redirect({
        to: '/',
      })

    context.queryClient.prefetchQuery(getEventFeesQueryOptions(params.eventId))
  },
  component: ManageMoney,
})
