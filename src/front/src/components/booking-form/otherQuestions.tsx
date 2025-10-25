/* import { Grid, TextField, Typography } from "@mui/material"
import { JsonBookingType } from "../../../lambda-common/onetable.js"
import React from "react"
import { getMemoUpdateFunctions } from "../../../shared/util.js"
import { PartialDeep } from "type-fest"
 */

import { ActionIcon, Box, Button, Flex, Grid, Group, LoadingOverlay, Overlay, Paper, Radio, Text, Textarea, TextInput, Title } from '@mantine/core'
import { useFieldArray, UseFieldArrayAppend, UseFieldArrayRemove, useFormContext } from 'react-hook-form'
import { z } from 'zod/v4'

import { BookingSchemaForType } from '../../../../shared/schemas/booking'
import { errorProps, useEvent } from '../../utils'
import { CustomRadioGroup } from '../custom-inputs/customRadioGroup'

export function OtherQuestionsForm() {
  const { register, formState } = useFormContext<z.infer<typeof BookingSchemaForType>>()

  const { errors } = formState
  const e = errorProps(errors)

  const event = useEvent()

  if (event.bigCampMode) {
    return (
      <Grid>
        <Grid.Col>
          <Title size="h4" order={2} mt={16}>
            Other Stuff
          </Title>
          <CustomRadioGroup name="other.shuttle" label="Will you need the shuttle bus to/from the station to camp?">
            <Group mt={8}>
              <Radio value={'yes'} label="Yes " />
              <Radio value={'maybe'} label="Not sure - but might" />
              <Radio value={'no'} label="No" />
            </Group>
          </CustomRadioGroup>
          <Textarea
            mt={8}
            label="Anything else:"
            {...register('other.anythingElse')}
            {...e('anythingElse')}
            autoComplete={`section-anything-else anything-else`}
            id={`section-anything-else-anything-else`}
            data-form-type="other"
          />
        </Grid.Col>
      </Grid>
    )
  } else {
    return (
      <Grid>
        <Grid.Col>
          <Title size="h4" order={2} mt={16}>
            Other Stuff
          </Title>
          <CustomRadioGroup name="other.whatsApp" label="Do you want to be added to camp Whatsapp group?">
            <Group mt={8}>
              <Radio value={'yes'} label="Yes" />
              <Radio value={'no'} label="No" />
            </Group>
          </CustomRadioGroup>
          <Textarea
            mt={8}
            label="Anything else:"
            {...register('other.anythingElse')}
            {...e('anythingElse')}
            autoComplete={`section-anything-else anything-else`}
            id={`section-anything-else-anything-else`}
            data-form-type="other"
          />
        </Grid.Col>
      </Grid>
    )
  }
}
