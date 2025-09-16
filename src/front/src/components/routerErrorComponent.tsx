import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { useEffect } from 'react'
import { serializeError } from 'serialize-error'

function logError(message: any, stack: any, from = '') {
  try {
    const jsonMessage = {
      message: message,
      stack: stack,
      from: from,
    }

    const jsonString = JSON.stringify(jsonMessage)

    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      credentials: 'same-origin',
      body: jsonString,
    }

    fetch('/api/error', options)
  } catch (e) {
    console.error(e)
    // ah well we tried
  }
}

export const RouterErrorComponent = ({ error }: { error: Error | AxiosError }) => {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    if (error instanceof AxiosError && error.code === 'ERR_BAD_RESPONSE' && error.response?.status === 500) {
      queryErrorResetBoundary.reset()
    } else {
      logError(serializeError(error), error.stack, 'Router Error Component')
      // Reset the query error boundary
      queryErrorResetBoundary.reset()
    }
  }, [queryErrorResetBoundary])

  let errorMessage = 'Unknown error'

  try {
    errorMessage = JSON.stringify(error)
  } catch (e) {
    console.error('Error stringifying error:', e)
  }

  return (
    <div>
      {errorMessage}
      <button
        onClick={() => {
          // Invalidate the route to reload the loader, and reset any router error boundaries
          router.invalidate()
        }}
      >
        retry
      </button>
    </div>
  )
}
