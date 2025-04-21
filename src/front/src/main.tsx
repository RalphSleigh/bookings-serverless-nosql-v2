import ReactDOM from 'react-dom/client'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css';

import { createTheme, MantineProvider, virtualColor } from '@mantine/core'
import { QueryClient, QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { useEffect } from 'react'

import { getPermissionsFromUser } from '../../shared/permissions'
import { useAuth } from './auth'
import { SuspenseWrapper } from './components/suspense'
import { AbilityContext } from './permissionContext'
import { routeTree } from './routeTree.gen'
import { DatesProvider } from '@mantine/dates';

const queryClient = new QueryClient()

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const router = createRouter({
  context: { queryClient, auth: undefined!, permission: undefined! },
  routeTree,
  defaultPreload: 'intent',
})

/* const theme = createTheme({
  colors:{
    appBackground: virtualColor({name: 'appBackground', light:'gray', dark: 'dark'}),
  }
})
 */

const App = () => {
  const auth = useAuth()
  useEffect(() => {
    router.invalidate()
  }, [auth.isAvailable, auth.loggedIn, auth.user])

  const permission = getPermissionsFromUser(auth.user)

  return (
    <AbilityContext.Provider value={permission}>
      <RouterProvider router={router} context={{ auth, permission }} />
    </AbilityContext.Provider>
  )
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <MantineProvider>
      <DatesProvider settings={{ timezone: 'UTC' }}>
      <QueryClientProvider client={queryClient}>
        <SuspenseWrapper>
          <App />
        </SuspenseWrapper>
      </QueryClientProvider>
      </DatesProvider>
    </MantineProvider>,
  )
}
