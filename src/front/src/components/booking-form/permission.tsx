import { Checkbox, Grid, Text, Title } from '@mantine/core'
import { Dispatch, SetStateAction } from 'react'

import { TEvent } from '../../../../shared/schemas/event'

import classes from '../../css/permissionCheckbox.module.css'

export const PermissionForm = ({ event, checked, setChecked }: { event: TEvent; checked: boolean; setChecked: Dispatch<SetStateAction<boolean>> }) => {
  return (
    <>
      <Title size="h4" order={2} mt={16} id="step-permission">
        Permission
      </Title>
      <Grid onClick={() => setChecked(!checked)} style={{ cursor: 'pointer' }}>
        <Grid.Col span={12}>
          <Checkbox
            size="xl"
            p={8}
            checked={checked}
            onChange={(event) => setChecked(event.currentTarget.checked)}
            m={8}
            className={classes.root}
          />
          <Text m={8} ml={16}>
            I give permission for the people named above to attend {event.name}.
          </Text>
          <Text m={8} ml={16}>
            I acknowledge it is my responsibility to ensure everyone over 16 attending has up-to-date Woodcraft Folk membership and completed a DBS check.
          </Text>
          <Text m={8} ml={16}>
            I agree this information will be stored electronically and shared only with individuals who need this information to engage your child safely in Woodcraft Folk activities. Based on the
            needs of your child we may also share any relevant information with medical or child protection professionals. For more information please visit 
            <a href="https://www.woodcraft.org.uk/privacy">www.woodcraft.org.uk/privacy</a> or contact <a href="mailto:data@woodcraft.org.uk">data@woodcraft.org.uk</a>
          </Text>
        </Grid.Col>
      </Grid>
    </>
  )
}
