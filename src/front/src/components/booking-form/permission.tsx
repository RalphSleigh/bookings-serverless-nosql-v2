import { Checkbox, Grid, Text, Title } from '@mantine/core'
import { Dispatch, SetStateAction } from 'react'

import { TEvent } from '../../../../shared/schemas/event'

export const PermissionForm = ({ event, checked, setChecked }: { event: TEvent; checked: boolean; setChecked: Dispatch<SetStateAction<boolean>> }) => {
  return (
    <>
      <Title order={3} mt={8}>
        Permission
      </Title>
      <Grid>
        <Grid.Col span={11}>
          <Text m={8} ml={16}>I give permission for the people named above to attend {event.name}.</Text>
          <Text m={8} ml={16}>I acknowledge it is my responsibility to ensure everyone over 16 attending has up-to-date Woodcraft Folk membership and completed a DBS check.</Text>
          <Text m={8} ml={16}>
            I agree this information will be stored electronically and shared only with individuals who need this information to engage your child safely in Woodcraft Folk activities. Based on the needs
            of your child we may also share any relevant information with medical or child protection professionals. For more information please visit{' '}
            <a href="https://www.woodcraft.org.uk/privacy">www.woodcraft.org.uk/privacy</a> or contact <a href="mailto:data@woodcraft.org.uk">data@woodcraft.org.uk</a>
          </Text>
        </Grid.Col>
        <Grid.Col span={1}>
          <Checkbox checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)} m={8} />
        </Grid.Col>
      </Grid>
    </>
  )
}
