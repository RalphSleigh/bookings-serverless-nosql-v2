import { subject } from '@casl/ability'
import { Grid, Paper, Tabs } from '@mantine/core'
import { getRouteApi, Outlet, useLocation, useNavigate, useParams, useRouterState } from '@tanstack/react-router'

import { Can } from '../../permissionContext'
import { CustomLink, useEvent } from '../../utils'

export const ManageWrapper = () => {
  const location = useLocation()
  const event = useEvent()
  const { eventId } = event

  const navigate = useNavigate()

  return (
    <>
      <Grid>
        <Grid.Col span={12}>
          <Paper data-breakout shadow="md" radius="md" withBorder m={8} p="md">
            <Tabs onChange={(value) => navigate({ to: `/event/$eventId/manage/${value}`, params: {} })} mt={-8} value={location.pathname.split('/').pop() || 'campers'}>
              <Tabs.List>
                <Tabs.Tab value="campers">Campers</Tabs.Tab>
                <Tabs.Tab value="bookings">Bookings</Tabs.Tab>
                {event.applicationsRequired && <Can I="getApplications" this={subject('eventId', { eventId })}>
                  <Tabs.Tab value="applications">Applications</Tabs.Tab>
                </Can>}
                <Can I="viewRoles" this={subject('eventId', { eventId })}>
                  <Tabs.Tab value="roles">Roles</Tabs.Tab>
                </Can>
                <Can I="getFees" this={subject('eventId', { eventId })}>
                  <Tabs.Tab value="money">Money</Tabs.Tab>
                </Can>
              </Tabs.List>
            </Tabs>
            <Outlet />
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  )
}
