import { Divider, Group, Radio, Text, Input } from '@mantine/core'

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
        <Divider my="xs" label="Consents" labelPosition="center" />
        <CustomRadioGroup<TBooking<TEvent<any, TEventVCampConsents>>>
          mt={16}
          name={`people.${index}.consents.photo`}
          required
        >
          <Group mt={8}>
            <Input.Label required><b>Image Consent:</b> I have permission for photos and recordings of this individual to be taken at the event and used by Woodcraft Folk. IFM and other external bodies for publications, social media and during the event on site.</Input.Label>
            <Radio value={'Yes'} label="Yes" />
            <Radio value={'No'} label="No" />
          </Group>
        </CustomRadioGroup>
        <CustomRadioGroup<TBooking<TEvent<any, TEventVCampConsents>>>
          name={`people.${index}.consents.activities`}
          mt={16}
          required
        >
          <Group mt={8}>
            <Input.Label required w="100%"><b>Adventurous Activities Consent:</b> I can confirm that this individual can swim 25m unaided.</Input.Label>
            <Radio value={'Yes'} label="Yes" />
            <Radio value={'No'} label="No" />
          </Group>
        </CustomRadioGroup>
        {needsRSEconsent ? <CustomRadioGroup<TBooking<TEvent<any, TEventVCampConsents>>>
          name={`people.${index}.consents.rse`}
          mt={16}
          required
        >
          <Group mt={8}>
            <Input.Label required><b>Relations & Sex Education Consent:</b> I have permission for this individual to take part in Relationship & Sex Education workshops as part of the Venturer Camp MEST-UP programme. Everyone on camp will take part in a basic consent workshop, this consent is for content above and beyond that. (<a href="https://woodcraft.org.uk/resources/relationship-sex-education-policy/" target="_blank">policy</a>)</Input.Label>
            <Radio value={'Yes'} label="Yes" />
            <Radio value={'No'} label="No" />
          </Group>
        </CustomRadioGroup> : <Text mt={16} size="sm" c="dimmed">(RSE consent is only required for those aged 12 - 17)</Text>}
      </>
    )
  }
}
