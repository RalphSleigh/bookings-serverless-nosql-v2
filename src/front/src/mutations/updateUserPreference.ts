import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import axios, { AxiosError, AxiosResponse } from 'axios'

import { TUserPreferenceUpdate } from '../../../lambda/endpoints/user/updateUserPreference'

export const updateUserPreference = (preference: 'emailNopeList' | 'driveSync', eventId: string) => {

  const queryClient = useQueryClient()

  return useMutation({
        mutationFn: async (state: boolean) => {
        return await axios.post<TUserPreferenceUpdate>(`/api/user/updateUserPreference`, { eventId, state, preference })
    },
    onSuccess: (data: AxiosResponse<TUserPreferenceUpdate>, context) => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      notifications.show({
        title: 'User Preferences Updated',
        message: `${data.data.preference}: ${data.data.state ? 'Enabled' : 'Disabled'}`,
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
