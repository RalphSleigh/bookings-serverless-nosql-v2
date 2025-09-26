import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { useContext } from 'react'

import { TCreateEventData } from '../../../lambda/endpoints/event/createEvent'
import { TEventWhenCreating } from '../../../shared/schemas/event'
import { TRole, TRoleForForm } from '../../../shared/schemas/role'

export const approveApplicationMutation = (eventId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      return await axios.post(`/api/event/${eventId}/manage/application/${userId}/approve`)
    },
    onSuccess: (data: AxiosResponse, context) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId, 'applications'] })
      notifications.show({
        title: 'Application Approved',
        message: `Application approved`,
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
