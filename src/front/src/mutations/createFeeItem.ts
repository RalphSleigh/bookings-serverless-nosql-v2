import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { useContext } from 'react'

import { TCreateEventData } from '../../../lambda/endpoints/event/createEvent'
import { TEventWhenCreating } from '../../../shared/schemas/event'
import { TRole, TRoleForForm } from '../../../shared/schemas/role'
import { TFeeForForm } from '../../../shared/schemas/fees'

export const createFeeItem = (eventId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fee: TFeeForForm) => {
      return await axios.post(`/api/event/${eventId}/manage/fee/create`, { fee: fee })
    },
    onSuccess: (data: AxiosResponse, context) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId, 'fees'] })
      notifications.show({
        title: 'Fee Item Created',
        message: `Fee item created`,
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
