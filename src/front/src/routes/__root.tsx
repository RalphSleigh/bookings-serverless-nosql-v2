import { AppShell, Box, Text } from '@mantine/core'
import { useQueryErrorResetBoundary, type QueryClient, type useSuspenseQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRoute, createRootRouteWithContext, Link, Outlet, useRouteContext, useRouter, useSearch } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { useEffect } from 'react'

import { getPermissionsFromUser } from '../../../shared/permissions'
import { useAuth } from '../auth'
import { AppToolbar } from '../components/appbar'
import { RouterErrorComponent } from '../components/routerErrorComponent'
import classes from '../css/mainArea.module.css'
import { envQueryOptions } from '../queries/env'
import { getEventsQueryOptions } from '../queries/getEvents'
import { getUserBookingsQueryOptions } from '../queries/geUserBookings'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  auth: ReturnType<typeof useAuth>
  permission: ReturnType<typeof getPermissionsFromUser>
}>()({
  component: RootComponent,
  beforeLoad: async ({ context }) => {
    const { queryClient } = context
    queryClient.ensureQueryData(envQueryOptions)
    queryClient.ensureQueryData(getEventsQueryOptions)
    queryClient.ensureQueryData(getUserBookingsQueryOptions)
  },

  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    // validate and parse the search params into a typed state
    if (search.redirect) return { redirect: search.redirect as string }
    return {}
  },

  errorComponent: RouterErrorComponent,
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
          <Box style={{ minHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
            <Box flex={1}>
              <Outlet />
            </Box>
            <Box>
              <Text size="xs" ta="center" c="dimmed" mt={16} mb={8}>
                &copy; {new Date().getFullYear()} Woodcraft Folk. Source on <a href="https://github.com/RalphSleigh/bookings-serverless-nosql-v2">GitHub</a>. <a href="/api/auth/redirect?switch=true">Switch User</a>.
              </Text>
            </Box>
          </Box>
        </AppShell.Main>
      </AppShell>
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}