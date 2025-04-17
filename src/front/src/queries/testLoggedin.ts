import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { fetchAfterUserQuery } from './fetchAfterUser';
import { UserResponseType } from '../../../lambda/endpoints/user/getUser';

export const testUserLoggedInOptions = queryOptions({
    queryKey: ['testUserLoggedIn'],
    queryFn: fetchAfterUserQuery<UserResponseType>('/api/test/loggedIn'),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

