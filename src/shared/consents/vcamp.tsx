import { Divider, Group, Radio, Text } from '@mantine/core'

import { CustomRadioGroup } from '../../front/src/components/custom-inputs/customRadioGroup'
import { TBooking } from '../schemas/booking'
import { TEvent, TEventVCampConsents } from '../schemas/event'
import { ConsentPersonFormSection, ConsentStructure } from './consents'
import { useWatch } from 'react-hook-form'
import { useEvent } from '../../front/src/utils'
import { TPerson, TPersonAttendance, TPersonKPData } from '../schemas/person'
import dayjs from 'dayjs'

export class VCampConsents implements ConsentStructure<TEventVCampConsents> {
  typeName: 'vcamp' = 'vcamp'
  FormSection: ConsentPersonFormSection = ({ index }) => {

    const dob = useWatch<{ people: TBooking<TEvent<any, TEventVCampConsents>>['people'] }>({
      name: `people.${index}.basic.dob`
    })

    const event = useEvent()
    if (!event) return null
    const DoBdate = typeof dob === 'string' ? dayjs(dob) : null
    const EventStartDate = dayjs(event.startDate)

    const needsRSEconsent = DoBdate && DoBdate.add(12, 'years').isBefore(EventStartDate) && DoBdate.add(18, 'years').isAfter(EventStartDate)

    return (
      <>
        <Divider my="xs" label="Attendance" labelPosition="center" />
        <CustomRadioGroup<TBooking<TEvent<any, TEventVCampConsents>>>
          mt={16}
          name={`people.${index}.consents.photo`}
          label="Image Consent: I have permission for photos and recordings of this individual to be taken at the event and used by Woodcraft Folk. IFM and other external bodies for publications, social media and during the event on site."
          required
        >
          <Group mt={8}>
            <Radio value={'Yes'} label="Yes" />
            <Radio value={'No'} label="No" />
          </Group>
        </CustomRadioGroup>
        <CustomRadioGroup<TBooking<TEvent<any, TEventVCampConsents>>>
          name={`people.${index}.consents.activities`}
          label="Adventurous Activities Consent: I can confirm that this individual can swim 25m unaided."
          mt={16}
          required
        >
          <Group mt={8}>
            <Radio value={'Yes'} label="Yes" />
            <Radio value={'No'} label="No" />
          </Group>
        </CustomRadioGroup>
        {needsRSEconsent ? <CustomRadioGroup<TBooking<TEvent<any, TEventVCampConsents>>>
          name={`people.${index}.consents.rse`}
          label="Relations & Sex Education Consent: I have permission for this individual to take part in Relationship & Sex Education workshops as part of Camp 100 MEST UP programme. Everyone on camp will take part in a basic consent workshop, this consent is for content above and beyond that. (policy)"
          mt={16}
          required
        >
          <Group mt={8}>
            <Radio value={'Yes'} label="Yes" />
            <Radio value={'No'} label="No" />
          </Group>
        </CustomRadioGroup> : <Text mt={16} size="sm" c="dimmed">(RSE consent is only required for those aged 12 - 17)</Text>}
      </>
    )
  }
}
