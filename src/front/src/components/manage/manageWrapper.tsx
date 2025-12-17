import { subject } from '@casl/ability'
import { Box, Button, Container, Grid, Mark, Modal, Paper, ScrollArea, Stack, Tabs } from '@mantine/core'
import { Column } from '@react-email/components'
import { getRouteApi, Outlet, useLocation, useNavigate, useParams, useRouterState } from '@tanstack/react-router'
import Markdown from 'react-markdown'

import { Can } from '../../permissionContext'
import { CustomLink, useEvent, useStickyState } from '../../utils'
import { POLICY_MARKDPOWN } from './policy'

export const ManageWrapper = () => {
  const location = useLocation()
  const event = useEvent()
  const { eventId } = event

  const navigate = useNavigate()

  const [hasSeenPolicy, setHasSeenPolicy] = useStickyState(false, 'hasSeenManagePolicy')

  return (
    <>
      {!hasSeenPolicy && (
        <Modal opened={!hasSeenPolicy} onClose={() => setHasSeenPolicy(true)} size="lg" closeOnClickOutside={false} closeOnEscape={false} withCloseButton={false}>
          <Box h="calc(100dvh - var(--modal-y-offset) * 2 - var(--mantine-spacing-md) * 2)">
            <Stack h="100%" gap={0}>
              <ScrollArea pr={16}>
                <Markdown>{POLICY_MARKDPOWN}</Markdown>
              </ScrollArea>
              <Box>
                <Button mt="md" onClick={() => setHasSeenPolicy(true)}>
                  Agree
                </Button>
              </Box>
            </Stack>
          </Box>
        </Modal>
      )}
      <Container strategy="grid" fluid>
        <Paper data-breakout shadow="md" radius="md" withBorder m={8} p="md">
          <Tabs onChange={(value) => navigate({ to: `/event/$eventId/manage/${value}`, params: {} })} mt={-8} value={location.pathname.split('/').pop() || 'campers'}>
            <Tabs.List>
              <Tabs.Tab value="campers">Campers</Tabs.Tab>
              <Tabs.Tab value="bookings">Bookings</Tabs.Tab>
              <Can I="getSensitiveFields" this={subject('eventId', { eventId })}>
                <Tabs.Tab value="kp">KP</Tabs.Tab>
              </Can>
              {event.applicationsRequired && (
                <Can I="getApplications" this={subject('eventId', { eventId })}>
                  <Tabs.Tab value="applications">Applications</Tabs.Tab>
                </Can>
              )}
              <Can I="viewRoles" this={subject('eventId', { eventId })}>
                <Tabs.Tab value="roles">Roles</Tabs.Tab>
              </Can>
              <Can I="getFees" this={subject('eventId', { eventId })}>
                <Tabs.Tab value="money">Money</Tabs.Tab>
              </Can>
              <Tabs.Tab value="settings">Settings</Tabs.Tab>
            </Tabs.List>
          </Tabs>
          <Outlet />
        </Paper>
      </Container>
    </>
  )
}
