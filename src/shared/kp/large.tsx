import { TBooking,  } from '../schemas/booking'
import { TEvent, TEventLargeKP } from '../schemas/event'
import { TPersonLargeKPData } from '../schemas/person'
import { KPStructure } from './kp'

export class LargeKP implements KPStructure<TEventLargeKP> {
  typeName: 'large' = 'large'

  ManageKPPageList: React.FC<{ event: TEvent<TEventLargeKP>; bookings: TBooking<TEvent<TEventLargeKP>>[] }> = () => {
    return <></>
  }
}
 