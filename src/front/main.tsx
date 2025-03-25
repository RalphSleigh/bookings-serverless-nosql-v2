import React, { use, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './src/routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import CssBaseline from '@mui/material/CssBaseline';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeContext, ThemeProvider } from '@emotion/react'
import { SnackBarProvider } from './toasts'
import { createTheme, useColorScheme, useMediaQuery, useTheme } from '@mui/material'
import { useStickyState } from './utils'

const queryClient = new QueryClient()

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
})

const router = createRouter({
  context: {
    queryClient,
  },
  routeTree,
  defaultPreload: 'intent',
  Wrap: ({ children }) =>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
})

const rootElement = document.getElementById('app')!

const Wrapper = (props: { children: any }) => {
  const { mode, systemMode, setMode } = useColorScheme()
  const theme = useTheme()
  console.log("MODE IS", mode)
  return <>
    <p> MODE IS {mode}</p>
    <p> SYSTEM IS {systemMode}</p>
    <p>{JSON.stringify(theme)}</p>
    {props.children}
  </>
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Wrapper>
        <p>test</p>
      </Wrapper>
    </ThemeProvider>)
}

//        <RouterProvider router={router} />