import { subject } from '@casl/ability'
import { Grid, Tabs } from '@mantine/core'
import { getRouteApi, Outlet, useRouterState } from '@tanstack/react-router'

import { Can } from '../../permissionContext'
import { CustomLink } from '../../utils'

export const ManageWrapper = () => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const { eventId } = route.useParams()

  return (
    <>
      <Grid>
        <Grid.Col span={12}>
          <CustomLink to="/event/$eventId/manage/campers" params={{ eventId }}>
            Campers
          </CustomLink>
          <CustomLink to="/event/$eventId/manage/bookings" params={{ eventId }}>
            Bookings
          </CustomLink>
          <Can I="viewRoles" this={subject('eventId', { eventId })}>
            <CustomLink to="/event/$eventId/manage/roles" params={{ eventId }}>
              Roles
            </CustomLink>
          </Can>
        </Grid.Col>
      </Grid>
      <Outlet />
    </>
  )
}
