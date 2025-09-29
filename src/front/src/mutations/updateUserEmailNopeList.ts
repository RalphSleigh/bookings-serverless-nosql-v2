import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { useContext } from 'react'

import { TCreateEventData } from '../../../lambda/endpoints/event/createEvent'
import { TEventWhenCreating } from '../../../shared/schemas/event'
import { TRole, TRoleForForm } from '../../../shared/schemas/role'
import { TUserNopeListUpdate } from '../../../lambda/endpoints/user/updateUserNopeList'

export const updateUserNopeList = (eventId: string) => {

  const queryClient = useQueryClient()

  return useMutation({
        mutationFn: async (state: boolean) => {
        return await axios.post<TUserNopeListUpdate>(`/api/user/updateNopeList`, { eventId, state })
    },
    onSuccess: (data: AxiosResponse, context) => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      notifications.show({
        title: 'User Preferences Updated',
        message: `User preferences updated`,
        color: 'green',
      })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        notifications.show({
          title: 'Error',
          message: `Error: ${error.response?.data?.message || 'Unknown error'}`,
          color: 'red',
        })
      } else {
        notifications.show({
          title: 'Error',
          message: `Error: ${error.message || 'Unknown error'}`,
          color: 'red',
        })
      }
    },
  })
}
