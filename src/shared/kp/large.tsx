import { TBooking } from '../schemas/booking'
import { TEvent, TEventLargeKP } from '../schemas/event'
import { TPerson, TPersonLargeKPData } from '../schemas/person'
import { KPStructure } from './kp'
import { Text } from '@mantine/core'

export class LargeKP implements KPStructure<TEventLargeKP> {
  typeName: 'large' = 'large'

  ManageKPPageList: React.FC<{ event: TEvent<TEventLargeKP>; campers: TPerson<TEvent<TEventLargeKP>>[] }> = () => {
    return (
      <>
        <p>large KP management page</p>
      </>
    )
  }

  PersonCardSection: React.FC<{ person: TPerson<TEvent<TEventLargeKP>> }> = ({ person }) => {
    return (
      <>
        <Text>
          {' '}
          <b>Diet:</b> {person.kp.diet}
        </Text>
        {person.kp.details && (
          <Text>
            {' '}
            <b>Details:</b> {person.kp.details}
          </Text>
        )}
      </>
    )
  }
}
