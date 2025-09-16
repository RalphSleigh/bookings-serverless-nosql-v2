import ReactDOM from 'react-dom/client'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'

import { createTheme, MantineProvider, virtualColor } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { useEffect } from 'react'

import { getPermissionsFromUser } from '../../shared/permissions'
import { useAuth } from './auth'
import { SuspenseLoader, SuspenseWrapper } from './components/suspense'
import { AbilityContext } from './permissionContext'
import { userQueryOptions } from './queries/user'
import { routeTree } from './routeTree.gen'
import { ReactErrorBoundary } from './components/errorBoundry'

window.addEventListener('error', (message) => {
            try {
                const jsonMessage = {
                    from: "Window Event Listener",
                    message: message.message,
                    file: message.filename,
                    line: message.lineno,
                    column: message.colno,
                };

                const jsonString = JSON.stringify(jsonMessage);

                const options = {
                    method: 'POST',
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    },
                    credentials: "same-origin" as const,
                    body: jsonString
                };
                console.log("LOGGING FROM WINDOW LISTENER")
                fetch('/api/error', options)
                return false
            } catch (e) {
                console.error(e)
                // ah well we tried
            }
          })

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
  defaultPendingComponent: SuspenseLoader,
})

/* const theme = createTheme({
  colors:{
    appBackground: virtualColor({name: 'appBackground', light:'gray', dark: 'dark'}),
  }
})
 */

const App = () => {
  console.log('App render')
  const user = useSuspenseQuery(userQueryOptions)
  const auth = useAuth(user)
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
    <ReactErrorBoundary>
      <MantineProvider>
        <SuspenseWrapper>
          <DatesProvider settings={{ locale: 'en', firstDayOfWeek: 0 }}>
            <QueryClientProvider client={queryClient}>
              <Notifications />
              <App />
            </QueryClientProvider>
          </DatesProvider>
        </SuspenseWrapper>
      </MantineProvider>
    </ReactErrorBoundary>,
  )
}
