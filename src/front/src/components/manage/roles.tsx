import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionIcon, Avatar, Box, Button, Combobox, Container, Flex, Grid, Group, Input, Paper, Table, Text, TextInput, useCombobox } from '@mantine/core'
import { IconChevronDown } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useEffect } from 'react'
import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form'

import { RoleForFormSchema, TRole, TRoleForForm } from '../../../../shared/schemas/role'
import { TUser } from '../../../../shared/schemas/user'
import classes from '../../css/userSelect.module.css'
import { createRoleMuation } from '../../mutations/createRole'
import { deleteRoleMuation } from '../../mutations/deleteRole'
import { getEventRolesQueryOptions } from '../../queries/getEventRoles'
import { getUsersQueryOptions } from '../../queries/getUsers'
import { CustomSelect } from '../custom-inputs/customSelect'

export const ManageRoles = () => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const { eventId } = route.useParams()
  const rolesQuery = useSuspenseQuery(getEventRolesQueryOptions(eventId))
  const usersQuery = useSuspenseQuery(getUsersQueryOptions(eventId))

  const form = useForm<TRoleForForm>({
    resolver: zodResolver(RoleForFormSchema),
    mode: 'onChange',
    defaultValues: { eventId: eventId } as TRoleForForm,
  })
  const { handleSubmit, control, formState } = form
  const { isValid } = formState

  const rolesData: { value: TRole['role']; label: string }[] = [
    { value: 'owner', label: 'Owner' },
    { value: 'manager', label: 'Manager' },
    { value: 'viewer', label: 'Viewer' },
  ]

  const createMutation = createRoleMuation(eventId)
  const onSubmit: SubmitHandler<TRoleForForm> = (data, event) => {
    console.log('Submitting role:', data)
    const valid = RoleForFormSchema.parse(data)
    createMutation.mutate(data)
  }

  const deleteMutation = deleteRoleMuation(eventId)

  const roleRows = rolesQuery.data.roles.map((role) => {
    const user = usersQuery.data.users.find((user) => user.userId === role.userId)
    if (!user) return null
    return (
      <Table.Tr key={role.roleId}>
        <Table.Td>
          <UserItem user={user} />
        </Table.Td>
        <Table.Td>{role.role}</Table.Td>
        <Table.Td>
          <Button variant="outline" color="red" onClick={() => deleteMutation.mutate(role.roleId)}>
            Remove
          </Button>
        </Table.Td>
      </Table.Tr>
    )
  })

  return (
    <Container strategy="grid" fluid>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid mt={16}>
            <Grid.Col span={5}>
              <UserSelect />
            </Grid.Col>
            <Grid.Col span={5}>
              <CustomSelect styles={{ input: { height: 50 } }} data={rolesData} name="role" control={control} placeholder="Choose role" />
            </Grid.Col>
            <Grid.Col span={2}>
              <Button h={50} type="submit" fullWidth disabled={!isValid}>
                Add Role
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </FormProvider>
      <Grid>
        <Grid.Col>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{roleRows}</Table.Tbody>
          </Table>
        </Grid.Col>
      </Grid>
    </Container>
  )
}

const UserItem = ({ user }: { user: TUser }) => {
  return (
    <Group flex={1} gap={8} wrap="nowrap">
      <Avatar
        src={user.avatar}
        size={32}
        imageProps={{
          referrerPolicy: 'no-referrer',
        }}
      />
      <Text style={{ textOverflow: 'ellipsis', overflow: 'hidden' }} size='sm'>
        {user.name} ({user.email})
      </Text>
    </Group>
  )
}

const UserSelect = ({}) => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const { eventId } = route.useParams()
  const usersQuery = useSuspenseQuery(getUsersQueryOptions(eventId))

  const userCombobox = useCombobox()

  const items = usersQuery.data.users.map((user) => (
    <Combobox.Option key={user.userId} value={user.userId}>
      <UserItem user={user} />
    </Combobox.Option>
  ))

  const { setValue, watch, register } = useFormContext<TRoleForForm>()
  const userId = watch('userId')
  const selectedUser = usersQuery.data.users.find((user) => user.userId === userId)

  useEffect(() => {
    register('userId')
  }, [register])

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        setValue('userId', optionValue, {
          shouldValidate: true,
          shouldDirty: true,
        })
        userCombobox.closeDropdown()
      }}
      store={userCombobox}
      withinPortal={true}
    >
      <Combobox.Target>
        {selectedUser ? (
          <Box pl={8} pr={8} className={classes.root} onClick={() => userCombobox.openDropdown()} onFocus={() => userCombobox.openDropdown()} onBlur={() => userCombobox.closeDropdown()}>
            <Flex h={48} align="center">
              <UserItem user={selectedUser} />
              <ActionIcon size={32} c="grey" variant="transparent" onClick={() => userCombobox.openDropdown()} onFocus={() => userCombobox.openDropdown()} onBlur={() => userCombobox.closeDropdown()}>
                <IconChevronDown size={32} />
              </ActionIcon>
            </Flex>
          </Box>
        ) : (
          <Box pl={8} pr={8} className={classes.root} onClick={() => userCombobox.openDropdown()} onFocus={() => userCombobox.openDropdown()} onBlur={() => userCombobox.closeDropdown()}>
            <Flex h={48} align="center">
              <Box flex={1} pl={8}>
                <Text>Choose user</Text>
              </Box>
              <ActionIcon size={32} c="grey" variant="transparent" onClick={() => userCombobox.openDropdown()} onFocus={() => userCombobox.openDropdown()} onBlur={() => userCombobox.closeDropdown()}>
                <IconChevronDown size={32} />
              </ActionIcon>
            </Flex>
          </Box>
        )}
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options mah={"70vh"} style={{ overflowY: 'auto' }}>{items}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
