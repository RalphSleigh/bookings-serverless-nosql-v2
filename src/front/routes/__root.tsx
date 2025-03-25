import * as React from 'react'
import { Link, Outlet, createRootRoute, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { envQueryOptions } from '../queries/env'
import { AppToolbar } from '../components/appbar'
import { createTheme, ThemeProvider, useColorScheme, useTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
<<<<<<< HEAD
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(envQueryOptions)
  },
})

function RootComponent() {

  return (
    <>
        <AppToolbar />
        <Outlet />
        <ReactQueryDevtools buttonPosition="bottom-right" />
        <TanStackRouterDevtools position="bottom-right" />
=======
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TanStackRouterDevtools position="bottom-right" />
>>>>>>> 125a5e82906a257ccdb3796ff8d14693dfe4e18d
    </>
  )
}
