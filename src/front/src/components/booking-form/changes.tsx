import { DefaultValues } from "react-hook-form";
import { BookingSchemaForType, TBooking } from "../../../../shared/schemas/booking";
import { useState } from "react";
import { WatchDebounce } from "../../utils";
import z from "zod/v4";
import React from "react";
import { generateDiscordDiff } from "../../../../shared/bookingDiff";
import { Flex, Paper, Title, Text } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";


export const ChangesDisplay: React.FC<{inputData: DefaultValues<TBooking> & { userId: string; eventId: string }}> = ({inputData}) => {
  const [data, setData] = useState<z.input<typeof BookingSchemaForType>>(inputData as z.input<typeof BookingSchemaForType>)

  return (
    <>
      <WatchDebounce value={data} set={setData} name={undefined} duration={500} />
      <MemoChangesDisplay inputData={inputData} currentData={data} />
    </>
  )
}



const ChangeDisplayComponent:React.FC<{inputData: DefaultValues<TBooking> & { userId: string; eventId: string }, currentData: z.input<typeof BookingSchemaForType>}> = ({inputData, currentData}) => {

    const changes = generateDiscordDiff(inputData as TBooking, currentData as TBooking)
    return <Paper shadow="md" radius="md" withBorder mt={16} p="lg" c="blue.9" bg="blue.0" bd="1 solid blue.3">
      <Flex gap="xs" align="center" mb={8}>
        <IconRefresh size={32} stroke={1.5} color="var(--mantine-color-blue-9)" />
        <Title order={2} size="h4">
          Changes you have made:
        </Title>
      </Flex>
      {changes.map((message, i) => (
        <Text key={i}>{message}</Text>
      ))}
    </Paper>

}

const MemoChangesDisplay = React.memo(ChangeDisplayComponent)