import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { useContext } from 'react'

import { TCreateEventData } from '../../../lambda/endpoints/event/createEvent'
import { TEventWhenCreating } from '../../../shared/schemas/event'
import { TRole, TRoleForForm } from '../../../shared/schemas/role'
import { TFee, TFeeForForm } from '../../../shared/schemas/fees'

export const deleteFeeItem = (eventId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fee: TFee) => {
      return await axios.delete(`/api/event/${eventId}/manage/fee/${fee.feeId}`)
    },
    onSuccess: (data: AxiosResponse, context) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId, 'fees'] })
      notifications.show({
        title: 'Fee Item Deleted',
        message: `Fee item deleted`,
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
