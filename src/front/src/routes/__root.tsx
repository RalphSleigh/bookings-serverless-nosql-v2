import { AppShell } from '@mantine/core'
import type { QueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRoute, createRootRouteWithContext, Link, Outlet, useRouteContext, useRouter, useSearch } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import * as React from 'react'

import { UserResponseType } from '../../../lambda/endpoints/user/getUser'
import { ContextUser } from '../../../lambda/middleware/context'
import { getPermissionsFromUser } from '../../../shared/permissions'
import { useAuth } from '../auth'
import { AppToolbar } from '../components/appbar'
import { envQueryOptions } from '../queries/env'
import { getEventsQueryOptions } from '../queries/getEvents'
import { userQueryOptions } from '../queries/user'

import classes from '../css/mainArea.module.css'
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  auth: ReturnType<typeof useAuth>
  permission: ReturnType<typeof getPermissionsFromUser>
}>()({
  component: RootComponent,
  loader: ({ context: { queryClient } }) => {
    return Promise.all([queryClient.ensureQueryData(envQueryOptions), queryClient.ensureQueryData(getEventsQueryOptions)])
  },
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    // validate and parse the search params into a typed state
    if (search.redirect) return { redirect: search.redirect as string }
    return {}
  },
})

function RootComponent(): React.JSX.Element {
  const search = Route.useSearch()
  const { auth } = useRouteContext({ from: '__root__' })
  const router = useRouter()

  React.useLayoutEffect(() => {
    if (auth.loggedIn && search.redirect) {
      router.history.push(search.redirect)
    }
  }, [auth.loggedIn, search.redirect])

  return (
    <>
        <AppShell header={{ height: 48 }}>
        <AppToolbar />
        <AppShell.Main className={classes.root}>
          <Outlet/>
          </AppShell.Main>
        </AppShell>
        <ReactQueryDevtools buttonPosition="bottom-right" />
        <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}
