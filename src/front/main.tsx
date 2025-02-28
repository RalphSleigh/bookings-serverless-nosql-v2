import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import CssBaseline from '@mui/material/CssBaseline';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeContext, ThemeProvider } from '@emotion/react'
import { SnackBarProvider } from './toasts'
import { createTheme, useMediaQuery } from '@mui/material'
import { useStickyState } from './utils'

const queryClient = new QueryClient()

// Set up a Router instance
const router = createRouter({
  context: {
    queryClient,
  },
  routeTree,
  defaultPreload: 'intent',
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const themeDef = (mode: string) => ({
  palette: {
    mode, ...(mode === "light" ? {} : {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#9c27b0',
      },
      background: {
        default: '#030412',
        paper: '#030412',
      },
      text: {
        primary: 'rgba(255,255,255,0.9)',
      },
    })
  }
})

export function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useStickyState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light', "color-mode");
  const colorMode = useMemo(
    () => ({
      mode: mode,
      toggleColorMode: () => {
        setMode((prevMode: string) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () => createTheme({
      ...themeDef(mode),
      components: {
        //@ts-ignore
        MuiDataGrid: {
          styleOverrides: {
            root: {
              '.participant-row-deleted-true': {
                opacity: 0.5,
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none'
              },
              '& .MuiDataGrid-cell:focus-within': {
                outline: 'none'
              },
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer'
              }
            },
          }
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              "& .hidden-button": {
                opacity: 0
              },
              "&:hover .hidden-button": {
                opacity: 1
              }
            }
          }
        }
      },
      spacing: 8,
    }),
    [mode],
  );

  return <QueryClientProvider client={queryClient}>
    <ThemeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme={true} />
        <SnackBarProvider>
          <RouterProvider router={router} />
        </SnackBarProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  </QueryClientProvider>
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <>
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </>

  )
}
