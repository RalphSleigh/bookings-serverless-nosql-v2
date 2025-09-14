import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { userQueryOptions } from '../queries/user'

export const Route = createFileRoute('/_user')({
  beforeLoad: async ({ location, context }) => {
    if (!context.auth.loggedIn || !context.auth.isAvailable || !context.auth.user) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      })
    }
    return {
      user: context.auth.user,
    }
  },
  component: Outlet,
})
