import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { envQueryOptions } from '../queries/env'
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  const envQuery = useSuspenseQuery(envQueryOptions)
  const env = envQuery.data
  return (
    <div className="p-2">
      <h3>Welcome Home! {env.env}</h3>
<<<<<<< HEAD
      <a href="/api/auth/redirect">Login</a>
=======
>>>>>>> 125a5e82906a257ccdb3796ff8d14693dfe4e18d
    </div>
  )
}
