import { Brightness4, Brightness7, BugReport } from "@mui/icons-material";
import { AppBar, Box, Button, IconButton, Link, Toolbar, Typography, useColorScheme, useMediaQuery, useTheme } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { useContext } from "react";
import { envQueryOptions } from "../queries/env";

export function AppToolbar() {
    const { mode, setMode } = useColorScheme()
    const theme = useTheme()
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const envQuery = useSuspenseQuery(envQueryOptions)
    const env = envQuery.data
    const [error, setError] = React.useState(false);
    const isDark = mode === "dark" || (mode === "system" && prefersDarkMode) || mode === undefined && prefersDarkMode

    if (error) throw ("BOOM (render)")

    return (<AppBar position="static">
        <Toolbar variant="dense">
                <Box
                    component="img"
                    sx={{
                        height: 40,
                        ml: -2.5,
                        mr: 1
                    }}
                    alt="Logo"
                    src="/logoonly.png"
                />
                <Link sx={{ flexShrink: 1, minWidth: 0, overflow: 'hidden' }} noWrap={true} underline="hover" variant="h6" color="inherit" href="/">
                    {window.location.hostname}
                </Link>
            <Box sx={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }} />
            { 
            //* <UserStatus /> **/
            }
            <IconButton sx={{ ml: 1 }} onClick={() => setMode(isDark ? 'light' : 'dark')} color="inherit">
                {isDark ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            {env.env === "dev" ? <><IconButton sx={{ ml: 1 }} onClick={() => { throw ("BOOM (event handler)") }} color="inherit">
                <BugReport color="warning" />
            </IconButton>
                <IconButton sx={{ ml: 1 }} onClick={() => { setError(true) }} color="inherit">
                    <BugReport color="warning" />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 1, color: "warning.main" }}>TEST MODE</Typography>
            </> : null}
        </Toolbar>
    </AppBar >)
}