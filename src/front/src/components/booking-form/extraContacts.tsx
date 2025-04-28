/* import { Grid, TextField, Typography } from "@mui/material"
import { JsonBookingType } from "../../../lambda-common/onetable.js"
import React from "react"
import { getMemoUpdateFunctions } from "../../../shared/util.js"
import { PartialDeep } from "type-fest"
 */

import { ActionIcon, Box, Button, Flex, Grid, LoadingOverlay, Overlay, Paper, Text, TextInput, Title } from '@mantine/core'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useFieldArray, UseFieldArrayAppend, UseFieldArrayRemove, useFormContext } from 'react-hook-form'
import { z } from 'zod'

import { BookingSchemaForType } from '../../../../shared/schemas/booking'

/* let key = 1

*/
export function ExtraContactsForm() {
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray<z.infer<typeof BookingSchemaForType>>({
    name: 'extraContacts', // unique name for your Field Array
  })

  const contacts = fields.map((f, i) => {
    return <ContactItem index={i} key={f.id} remove={remove} />
  })

  return (
    <Grid>
      <Grid.Col>
        <Title order={2} size="h5" mt={16}>
          Extra Contacts
        </Title>
        <Text>Here you can supply contact details for additional people we can contact about your booking, this is optional but may be useful.</Text>
        {contacts}
        <ContactItemOverlay append={append} />
      </Grid.Col>
    </Grid>
  )
}

const ContactItem = ({ index, remove }: { index: number; remove: UseFieldArrayRemove }) => {
  const { register, control } = useFormContext<z.infer<typeof BookingSchemaForType>>()

  return (
    <Paper shadow="md" radius="md" withBorder mt={16} pl={16} pr={16}>
      <Grid p={0} gutter={16}>
        <Grid.Col span={6}>
          <TextInput
            autoComplete={`section-extra-contact-${index} name`}
            id={`extra-contact-name-${index}`}
            data-form-type="other"
            label="Name"
            {...register(`extraContacts.${index}.name` as const)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Flex gap={16}>
            <TextInput
              style={{ flexGrow: 1 }}
              autoComplete={`section-extra-contact-${index} email`}
              id={`extra-contact-email-${index}`}
              data-form-type="other"
              label="Email"
              {...register(`extraContacts.${index}.email` as const)}
            />
            <ActionIcon variant="default" size="input-sm" onClick={() => remove(index)} mt={24}>
              <IconTrash size={16} stroke={1.5} color="red" />
            </ActionIcon>
          </Flex>
        </Grid.Col>
        <Grid.Col span={1}></Grid.Col>
      </Grid>
    </Paper>
  )
}

const ContactItemOverlay = ({ append }: { append: UseFieldArrayAppend<z.infer<typeof BookingSchemaForType>, 'extraContacts'> }) => {
  return (
    <Box style={{ position: 'relative', cursor: 'pointer' }} onClick={() => append({ name: '', email: '' })}>
      <Paper shadow="md" radius="md" withBorder mt={16} pl={16} pr={16}>
        <Grid p={0} gutter={16}>
          <Grid.Col span={6}>
            <TextInput label="Name" disabled />
          </Grid.Col>
          <Grid.Col span={6}>
            <Flex gap={16}>
              <TextInput label="Email" disabled style={{ flexGrow: 1 }}/>
              <ActionIcon variant="default" size="input-sm" mt={24} disabled>
                <IconTrash size={16} stroke={1.5} color="red" />
              </ActionIcon>
            </Flex>
          </Grid.Col>
          <Grid.Col span={1}></Grid.Col>
        </Grid>
      </Paper>
      <LoadingOverlay
        visible={true}
        overlayProps={{ c: 'body', backgroundOpacity: 0.2, blur: 2 }}
        loaderProps={{
          children: (
            <ActionIcon size={64} c="grey" variant="transparent">
              <IconPlus size={64} />
            </ActionIcon>
          ),
        }}
      />
    </Box>
  )
}

/*

function bookingExtraContactFields({ data, update, readOnly }: { data: PartialDeep<JsonBookingType>["extraContacts"], update: any, readOnly: boolean }) {

    const { updateArrayItem } = getMemoUpdateFunctions(update('extraContacts'))

    const contacts = (Array.isArray(data) ? [...data, {}] : [{}] ).map((d, i) => {
        return <ExtraContactPerson key={i} i={i} data={d} update={updateArrayItem(i)} last={!Array.isArray(data) || i == data.length} readOnly={readOnly}/>
    })

    return <>
        <Typography variant="h6" sx={{ mt: 2 }}>Extra Contacts</Typography>
        <Typography variant="body1">Here you can supply contact details for additional people we can contact about your booking, this is optional but may be useful.</Typography>
        {contacts}
    </>
}


const ExtraContactPerson = ({ i, data, update, last, readOnly }: { i: number, data: Partial<NonNullable<JsonBookingType["extraContacts"]>[0]>, update: any, last: boolean, readOnly: boolean }) => {

    if (!data.email && !data.name && !last) return null

    const { updateField } = getMemoUpdateFunctions(update)

    return <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
            <TextField
                autoComplete={`section-extra-contact-${i} name`} 
                name={`extra-contact-name-${i}`} 
                id={`extra-contact-name-${i}`} 
                inputProps={{'data-form-type': 'other'}} 
                fullWidth
                label="Name"
                value={data?.name || ''}
                onChange={updateField('name')} 
                disabled={readOnly} />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
                autoComplete={`section-extra-contact-${i} email`} 
                fullWidth
                name={`extra-contact-email-${i}`} 
                id={`extra-contact-email-${i}`}
                inputProps={{'data-form-type': 'other'}} 
                type="email"
                label="Email"
                value={data?.email || ''}
                onChange={updateField('email')} 
                disabled={readOnly} />
        </Grid>
    </Grid>

}

export const MemoBookingExtraContactFields = React.memo(bookingExtraContactFields) */
