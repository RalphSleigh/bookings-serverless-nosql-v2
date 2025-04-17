import { Brightness4, Brightness7, BugReport } from '@mui/icons-material';
import Logout from '@mui/icons-material/Logout';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Link,
  Toolbar,
  Typography,
  useColorScheme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';
import React, { useContext } from 'react';

import { envQueryOptions } from '../queries/env';
import { userQueryOptions } from '../queries/user';
import { MUIButtonLink, MUILink } from '../utils';
//import { useSuspenseIfUser } from '../queries/useSuspenseWrapper';

export const AppToolbar = () => {
  const { mode, systemMode, setMode } = useColorScheme();
  const { data: env } = useSuspenseQuery(envQueryOptions);
  const [error, setError] = React.useState(false);
  const isDark =
    mode === 'dark' || (mode === 'system' && systemMode === 'dark');

  if (error) throw 'BOOM (render)';

  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <Box
          component="img"
          sx={{
            height: 40,
            ml: -2.5,
            mr: 1,
          }}
          alt="Logo"
          src="/logoonly.png"
        />
        <Link
          sx={{ flexShrink: 1, minWidth: 0, overflow: 'hidden' }}
          noWrap={true}
          underline="hover"
          variant="h6"
          color="inherit"
          href="/"
        >
          {window.location.hostname}
        </Link>
        <Box sx={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }} />
        <UserStatus />
        <IconButton
          sx={{ ml: 1 }}
          onClick={() => setMode(isDark ? 'light' : 'dark')}
          color="inherit"
        >
          {isDark ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        {env.env === 'dev' ? (
          <>
            <IconButton
              sx={{ ml: 1 }}
              onClick={() => {
                throw 'BOOM (event handler)';
              }}
              color="inherit"
            >
              <BugReport color="warning" />
            </IconButton>
            <IconButton
              sx={{ ml: 1 }}
              onClick={() => {
                setError(true);
              }}
              color="inherit"
            >
              <BugReport color="warning" />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 1, color: 'warning.main' }}>
              TEST MODE
            </Typography>
          </>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

const UserStatus = () => {
  const  { auth } = useRouteContext({from:'__root__'});
  const user = auth.loggedIn ? auth.user : undefined;
  if (user) {
    return (
      <>
        <MUILink underline="hover" to="/user" color="inherit">
          <Typography variant="body1">
            {user.name?.replaceAll(' ', '\xa0') ?? ''}
          </Typography>
        </MUILink>
        <MUILink to="/user" style={{ textDecoration: 'none' }}>
          <Avatar
            imgProps={{ referrerPolicy: 'no-referrer' }}
            sx={{ width: 28, height: 28, ml: 1, boxShadow: 20 }}
            alt={user?.name ?? undefined}
            src={'/nope.jpg'}
          />
        </MUILink>
        <IconButton
          sx={{ ml: 1 }}
          component={'a'}
          href="/api/user/logout"
          color="inherit"
        >
          <Logout />
        </IconButton>
      </>
    );
  } else {
    return (
      <Button href="/api/auth/redirect" color="inherit">
        Login
      </Button>
    );
  }
};
