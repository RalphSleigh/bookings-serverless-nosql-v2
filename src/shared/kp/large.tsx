import { TBooking,  } from '../schemas/booking'
import { TEvent, TEventLargeKP } from '../schemas/event'
import { TPerson, TPersonLargeKPData } from '../schemas/person'
import { KPStructure } from './kp'

export class LargeKP implements KPStructure<TEventLargeKP> {
  typeName: 'large' = 'large'

  ManageKPPageList: React.FC<{ event: TEvent<TEventLargeKP>; campers: TPerson<TEvent<TEventLargeKP>>[] }> = () => {
    return <><p>large KP management page</p></>
  }
}
 