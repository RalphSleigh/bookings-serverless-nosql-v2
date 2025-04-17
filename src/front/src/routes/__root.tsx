import { CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider, useColorScheme, useTheme } from '@mui/material/styles'
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
import { SnackBarProvider } from '../toasts'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  auth: ReturnType<typeof useAuth>
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
  const search = useSearch({ from: '__root__' })
  const { auth } = useRouteContext({ from: '__root__' })
  const router = useRouter()

  React.useLayoutEffect(() => {
    if (auth.loggedIn && search.redirect) {
      router.history.push(search.redirect)
    }
  }, [auth.loggedIn, search.redirect])

  return (
    <>
      <SnackBarProvider>
        <AppToolbar />
        <Outlet />
        <ReactQueryDevtools buttonPosition="bottom-right" />
        <TanStackRouterDevtools position="bottom-right" />
      </SnackBarProvider>
    </>
  )
}
