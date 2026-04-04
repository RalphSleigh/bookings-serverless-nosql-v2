import { AspectRatio, Container, Grid, Title } from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getEventGraphDataQueryOptions } from '../../queries/getEventGraphData'

export const ManageGraphs: React.FC = () => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const { eventId } = route.useParams()
  const graphQuery = useSuspenseQuery(getEventGraphDataQueryOptions(eventId))

  const graphData = graphQuery.data.data.map((d) => {
    return { total: d.count, time: Date.parse(d.date) }
  })

  return (
    <Container strategy="grid" fluid>
      <Grid mt={16}>
        <Grid.Col span={12}>
          <Title order={3}>Bookings Over Time</Title>
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
                <XAxis dataKey="time" domain={['auto', 'auto']} name="Time" tickFormatter={(unixTime) => dayjs(unixTime).format('DD/MM/YYYY')} type="number" />
                <YAxis />
                <Tooltip labelFormatter={(label) => `Date: ${dayjs(label).format('DD/MM/YYYY')}`} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </AspectRatio>
        </Grid.Col>
      </Grid>
    </Container>
  )
}
