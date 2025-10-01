import { Container, Paper, Table, Title, Text } from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouteContext } from '@tanstack/react-router'
import * as React from 'react'

import { userQueryOptions } from '../../queries/user'

export const Route = createFileRoute('/_user/user')({
  component: UserComponent,
})

function UserComponent() {
  const context = useRouteContext({ from: '/_user' })
  const { user } = context

  return (
    <Container>
      <Paper shadow="md" radius="md" withBorder mt={16} p="md">
        <Title order={2} size="h5" mb={8}>
          User Details
        </Title>
        <Text mb={16}>
          Here are your user details, click <a href="/api/auth/redirect?switch=true">here</a> to switch user.
        </Text>
        <Table striped>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Name</Table.Td>
              <Table.Td>{user.name}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Email</Table.Td>
              <Table.Td>{user.email}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Subject</Table.Td>
              <Table.Td>{user.sub}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>ID</Table.Td>
              <Table.Td>{user.userId}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Woodcraft Folk Account:</Table.Td>
              <Table.Td>{user.isWoodcraft!.toString()}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Group/District Account:</Table.Td>
              <Table.Td>{user.isGroupAccount!.toString()}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  )
}
