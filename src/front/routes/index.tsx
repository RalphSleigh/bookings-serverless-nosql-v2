import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { envQueryOptions } from '../queries/env'
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/')({
  loader: ({ context: { queryClient }}) => {
    return queryClient.ensureQueryData(envQueryOptions)
  },
  component: HomeComponent,
})

function HomeComponent() {
  const envQuery = useSuspenseQuery(envQueryOptions)
  const env = envQuery.data
  return (
    <div className="p-2">
      <h3>Welcome Home! {env.env}</h3>
    </div>
  )
}
