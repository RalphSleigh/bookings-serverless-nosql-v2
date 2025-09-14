import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { fetchAfterUserQuery } from '../queries/fetchAfterUser'
import { TDataFromSheetType } from '../../../lambda/endpoints/booking/getDataFromSheet'

export const getCampersFromSheetMutation = () => {
  return useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => (await axios.get<TDataFromSheetType>(`/api/event/${eventId}/booking/${userId}/sheet/data`)).data,
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
