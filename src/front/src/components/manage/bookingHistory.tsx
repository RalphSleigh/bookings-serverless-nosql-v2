import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import 'json-diff-kit/dist/viewer.css'

import { Flex, Select, Title } from '@mantine/core'
import { Differ, Viewer } from 'json-diff-kit'

import { getEventBookingHistoryQueryOptions } from '../../queries/getEventBookingHistory'

const differ = new Differ({
  detectCircular: true, // default `true`
  maxDepth: Infinity, // default `Infinity`
  showModifications: true, // default `true`
  arrayDiffMethod: 'compare-key', // default `"normal"`, but `"lcs"` may be more useful
  compareKey: 'personId', // default `undefined`, but `"id"` may be more useful
})

export const ManageBookingHistory = () => {
  const route = getRouteApi('/_user/event/$eventId/manage/booking/$userId/history')
  const { eventId, userId } = route.useParams()
  const bookingsQuery = useSuspenseQuery(getEventBookingHistoryQueryOptions(eventId, userId))

  const versionDates = bookingsQuery.data.data.bookingHistory[0].versions.map((b) => b.updatedAt)

  const [startDate, setStartDate] = useState<number>(versionDates[versionDates.length - 2])
  const [endDate, setEndDate] = useState<number>(versionDates[versionDates.length - 1])

  const diffData = useMemo(() => {
    const v1 = bookingsQuery.data.data.bookingHistory[0].versions.find((v) => v.updatedAt === startDate)
    const v1people = bookingsQuery.data.data.personHistory.map((p) => p.versions.filter((v) => v.updatedAt <= startDate + 5000).pop()).filter((p) => p !== undefined)
    const v2 = bookingsQuery.data.data.bookingHistory[0].versions.find((v) => v.updatedAt === endDate)
    const v2people = bookingsQuery.data.data.personHistory.map((p) => p.versions.filter((v) => v.updatedAt <= endDate + 5000).pop()).filter((p) => p !== undefined)

    return differ.diff({ ...v1, people: v1people }, { ...v2, people: v2people })
  }, [bookingsQuery.data.data.bookingHistory, startDate, endDate])

  return (
    <>
      <Title order={4} mt={16} mb={16}>
        Booking History - {bookingsQuery.data.data.bookingHistory[0].versions[0].basic?.name} - {bookingsQuery.data.data.bookingHistory[0].versions[0].basic?.district}
      </Title>
      <Flex gap="md" mb={24}>
        <Select
          label="From"
          value={startDate.toString()}
          onChange={(v) => setStartDate(Number(v))}
          data={versionDates.map((d) => ({ value: d.toString(), label: new Date(d).toLocaleString(), disabled: d >= endDate }))}
        />
        <Select
          label="To"
          value={endDate.toString()}
          onChange={(v) => setEndDate(Number(v))}
          data={versionDates.map((d) => ({ value: d.toString(), label: new Date(d).toLocaleString(), disabled: d <= startDate }))}
        />
      </Flex>
      <Viewer
        diff={diffData} // required
        indent={4} // default `2`
        lineNumbers={true} // default `false`
        highlightInlineDiff={true} // default `false`
        inlineDiffOptions={{
          mode: 'word', // default `"char"`, but `"word"` may be more useful
          wordSeparator: ' ', // default `""`, but `" "` is more useful for sentences
        }}
      />
    </>
  )
}
