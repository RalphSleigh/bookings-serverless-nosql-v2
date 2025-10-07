import { Anchor, AnchorProps } from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createLink, getRouteApi, LinkComponent, Route } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { get } from 'lodash-es'
import React, { Dispatch, ReactElement, SetStateAction, useEffect } from 'react'
import { Control, useWatch } from 'react-hook-form'

import { TEvent } from '../../shared/schemas/event'
import { getEventsQueryOptions } from './queries/getEvents'

export function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(() => {
    const stickyValue = window.localStorage && window.localStorage.getItem(key)
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue
  })
  React.useEffect(() => {
    if (window.localStorage) window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

interface MantineAnchorProps extends Omit<AnchorProps, 'href'> {
  // Add any additional props you want to pass to the anchor
}

const MantineLinkComponent = React.forwardRef<HTMLAnchorElement, MantineAnchorProps>((props, ref) => {
  return <Anchor ref={ref} {...props} />
})

const CreatedLinkComponent = createLink(MantineLinkComponent)

export const CustomLink: LinkComponent<typeof MantineLinkComponent> = (props) => {
  return <CreatedLinkComponent preload="intent" {...props} />
}

export function getSubUpdate<
  T extends Record<string, any>,
  K extends keyof T &
    {
      [K in keyof Required<T>]: Required<T>[K] extends Record<string, any> ? K : never
    }[keyof Required<T>],
>(update: Dispatch<SetStateAction<T>>, key: K): Dispatch<SetStateAction<Required<T>[K]>> {
  console.log('UseMemo', key)
  return React.useMemo(
    () => (valueOrUpdater) => {
      update((prevData) => {
        const newValue = typeof valueOrUpdater === 'function' ? (valueOrUpdater as CallableFunction)(prevData[key] || ({} as Required<T>[K])) : valueOrUpdater
        return {
          ...prevData,
          [key]: newValue,
        }
      })
    },
    [],
  )
}

export function getArrayUpdate<T extends Record<string, any>, K extends keyof T & { [K in keyof Required<T>]: Required<T>[K] extends Array<any> ? K : never }[keyof Required<T>]>(
  update: Dispatch<SetStateAction<T>>,
  key: K,
): Dispatch<SetStateAction<undefined extends T[K] ? Required<T>[K] | undefined : Required<T>[K]>> {
  console.log('UseMemo', key)
  return React.useMemo(
    () => (valueOrUpdater) => {
      update((prevData) => {
        const newValue = typeof valueOrUpdater === 'function' ? (valueOrUpdater as CallableFunction)(prevData[key] || ([] as Required<T>[K])) : valueOrUpdater
        return {
          ...prevData,
          [key]: newValue,
        }
      })
    },
    [],
  )
}

export function getMemoObjectUpdateFunctions<T extends {}, F extends keyof T>(update: Dispatch<SetStateAction<T>>) {
  console.log('UseMemoObject')
  return React.useMemo(
    () => ({
      updateField: (field: F) => (e: { target: { value: string }; preventDefault: () => void }) => {
        update((data) => {
          return { ...data, [field]: e.target.value }
        })
        e.preventDefault()
      },
      updateDate: (field: F) => (e: string | Date | null) => {
        const value = e instanceof Date ? e.toISOString() : e
        update((data) => ({ ...data, [field]: value }))
      },
      updateSwitch: (field: F) => (e: React.ChangeEvent<HTMLInputElement>) => {
        update((data) => ({ ...data, [field]: e.target.checked }))
      },
      updateNumber: (field: F) => (e: React.ChangeEvent<HTMLInputElement>) => {
        update((data) => ({ ...data, [field]: parseInt(e.target.value) }))
        e.preventDefault()
      },
    }),
    [],
  )
}

export function getMemoArrayUpdateFunctions<T extends Array<any>>(update: Dispatch<SetStateAction<T | undefined>>) {
  console.log('UseMemoArray')
  return React.useMemo(
    () => ({
      updateItem: (index: number): Dispatch<SetStateAction<T[number]>> => {
        return (valueOrUpdater) => {
          update((prevData) => {
            prevData = prevData || ([] as unknown as T)
            const newValue = typeof valueOrUpdater === 'function' ? (valueOrUpdater as CallableFunction)(prevData[index] || ({} as T[number])) : valueOrUpdater
            const newData = [...prevData]
            newData[index] = newValue
            return newData as T
          })
        }
      },

      deleteItem: (index: number) => {
        update((prevData) => {
          prevData = prevData || ([] as unknown as T)
          const newData = [...prevData]
          newData.splice(index, 1)
          return newData as T
        })
      },
    }),
    [],
  )
}

export function toLocalDate(date: string): Date | null {
  let localDate = dayjs(date).toDate()
  if (!localDate) return null

  return new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000)
}

export const errorProps = (errors: any) => (path: string) => {
  const error = get(errors, path)
  if (error) {
    return { error: error.message }
  } else {
    return {}
  }
}

const route = getRouteApi('/_user/event/$eventId')

export const useEvent: () => TEvent = () => {
  const { eventId } = route.useParams()
  const { data } = useSuspenseQuery(getEventsQueryOptions)

  const event = data.events.find((event) => event.eventId === eventId)
  if (!event) {
    throw new Error(`Event with ID ${eventId} not found`)
  }
  return event
}

// https://github.com/orgs/react-hook-form/discussions/3078

interface DebounceProps {
  value: any
  set: (n: any) => void
  name: string | undefined
  duration?: number
}

export const WatchDebounce = ({ value, set, name, duration }: DebounceProps): ReactElement => {
  const internal = name === undefined ? useWatch() : useWatch({ name })

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== internal) {
        set(internal)
      }
    }, duration ?? 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [value, set, internal, duration])

  return <React.Fragment />
}
