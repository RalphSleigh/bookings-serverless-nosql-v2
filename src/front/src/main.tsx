import CssBaseline from '@mui/material/CssBaseline';
import ReactDOM from 'react-dom/client';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { QueryClient, QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { enGB } from 'date-fns/locale/en-GB';
import { useEffect } from 'react';

import { getPermissionsFromUser } from '../../shared/permissions';
import { useAuth } from './auth';
import { SuspenseWrapper } from './components/suspense';
import { AbilityContext } from './permissionContext';
import { routeTree } from './routeTree.gen';

const queryClient = new QueryClient();

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

const router = createRouter({
  context: { queryClient, auth: undefined! },
  routeTree,
  defaultPreload: 'intent',
});

const App = () => {
  const auth = useAuth();
  useEffect(() => {
    router.invalidate();
  }, [auth.isAvailable, auth.loggedIn, auth.user]);

  return (
    <AbilityContext.Provider value={getPermissionsFromUser(auth.user)}>
      <RouterProvider router={router} context={{ auth }} />
    </AbilityContext.Provider>
  );
};

const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <QueryClientProvider client={queryClient}>
          <SuspenseWrapper>
            <App />
          </SuspenseWrapper>
        </QueryClientProvider>
      </ThemeProvider>
    </LocalizationProvider>,
  );
}
