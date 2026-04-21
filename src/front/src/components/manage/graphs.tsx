import { AspectRatio, Box, Container, Grid, Group, Table, Text, Title } from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { CartesianGrid, LabelList, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { TPersonWithoutSensitiveInfo } from '../../../../lambda/endpoints/event/manage/getEventBookings'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'
import { getEventGraphDataQueryOptions } from '../../queries/getEventGraphData'
import { useEvent } from '../../utils'

const numberFormatter = new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const methodMap: Record<string, string> = {
  googleWCF: 'Google (Woodcraft Folk)',
  google: 'Google',
  apple: 'Apple',
  yahoo: 'Yahoo',
  microsoft: 'Microsoft',
  discord: 'Discord',
}

const fillMap: Record<string, string> = {
  googleWCF: 'green',
  google: 'red',
  apple: 'grey',
  yahoo: 'purple',
  microsoft: 'blue',
  discord: 'violet',
}

export const ManageGraphs: React.FC = () => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const { eventId } = route.useParams()
  const graphQuery = useSuspenseQuery(getEventGraphDataQueryOptions(eventId))
  const bookingQuery = useSuspenseQuery(getEventBookingsQueryOptions(eventId))
  const event = useEvent()

  const people: TPersonWithoutSensitiveInfo[] = bookingQuery.data.bookings.reduce((acc, b) => [...acc, ...(b.people || [])], [] as TPersonWithoutSensitiveInfo[])

  const volunteers = people.filter((p) => p.basic.role === 'volunteer').length
  const participants = people.filter((p) => p.basic.role === 'participant').length

  const graphData = graphQuery.data.data.map((d) => {
    return { total: d.count, time: Date.parse(d.date) }
  })

  const ticks = [] as number[]

  for (let month = dayjs(graphData[0].time).endOf('month').add(1, 'day').startOf('month'); month.isBefore(dayjs(graphData[graphData.length - 1].time)); month = month.add(1, 'month')) {
    ticks.push(month.valueOf())
  }

  const loginData = graphQuery.data.loginData

  const pieBookingData = Object.entries(loginData).map(([method, data]) => ({ name: methodMap[method] || method, value: data.bookings, fill: fillMap[method] || '#000000' }))
  const piePeopleData = Object.entries(loginData).map(([method, data]) => ({ name: methodMap[method] || method, value: data.total, fill: fillMap[method] || '#000000' }))
  return (
    <Container strategy="grid" fluid>
      <Grid mt={16}>
        {event.bigCampMode && (
          <>
            <Grid.Col span={12}>
              <Group grow preventGrowOverflow={false} gap={0}>
                <Box>
                  <Text
                    style={{
                      fontSize: '1.5rem',
                      textAlign: 'right',
                    }}
                  >
                    Participants
                  </Text>
                  <Text
                    style={{
                      fontSize: '0.8rem',
                      textAlign: 'right',
                      color: 'var(--mantine-primary-color-light-color)',
                    }}
                  >
                    {participants}
                  </Text>
                  <Text
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      textAlign: 'right',
                      color: 'var(--mantine-primary-color-filled)',
                    }}
                  >
                    {numberFormatter.format(participants / Math.min(participants, volunteers))}
                  </Text>
                </Box>
                <Box
                  style={{
                    flexGrow: 0,
                  }}
                  ml={4}
                  mr={4}
                >
                  <Text
                    style={{
                      fontSize: '1.5rem',
                      textAlign: 'center',
                    }}
                  >
                    :
                  </Text>
                  <Text
                    style={{
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      color: 'var(--mantine-primary-color-light-color)',
                    }}
                  >
                    :
                  </Text>
                  <Text
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: 'var(--mantine-primary-color-filled)',
                    }}
                  >
                    :
                  </Text>
                </Box>

                <Box>
                  <Text
                    style={{
                      fontSize: '1.5rem',
                      textAlign: 'left',
                    }}
                  >
                    Volunteers
                  </Text>
                  <Text
                    style={{
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      color: 'var(--mantine-primary-color-light-color)',
                    }}
                  >
                    {volunteers}
                  </Text>
                  <Text
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      color: 'var(--mantine-primary-color-filled)',
                    }}
                  >
                    {numberFormatter.format(volunteers / Math.min(participants, volunteers))}
                  </Text>
                </Box>
              </Group>
            </Grid.Col>
          </>
        )}
        <Grid.Col span={12}>
          <Title order={3}>People Booked Over Time</Title>
          <AspectRatio ratio={3} mt={16}>
            <ResponsiveContainer aspect={3}>
              <LineChart
                data={graphData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" domain={['dataMin', 'dataMax']} name="Time" tickFormatter={(unixTime) => dayjs(unixTime).format('MMM YYYY')} type="number" ticks={ticks} />
                <YAxis />
                <Tooltip labelFormatter={(label) => `Date: ${dayjs(label).format('DD/MM/YYYY')}`} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </AspectRatio>
        </Grid.Col>
        <Grid.Col span={12}>
          <Title order={3}>Login Methods</Title>
          {Object.entries(loginData).map(([method, data]) => (
            <Text key={method} c={fillMap[method] || '#000000'} component="span">
<b>&bull;&nbsp;{methodMap[method] || method}</b>&nbsp;</Text>
          ))}
        </Grid.Col>
        <Grid.Col span={6}>
          <Title order={4}>By Bookings</Title>
          <AspectRatio ratio={2} mt={16}>
          <ResponsiveContainer aspect={2}>
          <PieChart>
            <Pie data={pieBookingData} dataKey="value" nameKey="name"outerRadius="70%"/>
          </PieChart>
          </ResponsiveContainer>
          </AspectRatio>
        </Grid.Col>
        <Grid.Col span={6}>
          <Title order={4}>By People</Title>
          <AspectRatio ratio={2} mt={16}>
          <ResponsiveContainer aspect={2}>
          <PieChart>
            <Pie data={piePeopleData} dataKey="value" nameKey="name" outerRadius="70%"/>
          </PieChart>
          </ResponsiveContainer>
          </AspectRatio>
        </Grid.Col>
          <Grid.Col span={12}>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Method</Table.Th>
                <Table.Th>Bookings</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th>Average</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Object.entries(loginData).map(([method, data]) => (
                <Table.Tr key={method}>
                  <Table.Td>{methodMap[method] || method}</Table.Td>
                  <Table.Td>{data.bookings}</Table.Td>
                  <Table.Td>{data.total}</Table.Td>
                  <Table.Td>{data.bookings > 0 ? (data.total / data.bookings).toFixed(2) : ''}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Grid.Col>
      </Grid>
    </Container>
  )
}
