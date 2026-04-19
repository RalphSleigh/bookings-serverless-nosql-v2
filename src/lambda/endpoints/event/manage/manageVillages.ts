import { subject } from '@casl/ability'
import { v7 } from 'uuid'

import { FeeForCreateSchema, TFee } from '../../../../shared/schemas/fees'
import { TVillages, VillagesSchema } from '../../../../shared/schemas/villages'
import { currency } from '../../../../shared/util'
import { enqueueAsyncTask } from '../../../asyncTasks/asyncTaskQueuer'
import { DB, DBBooking, DBFee, DBRole, DBUser, DBVillage } from '../../../dynamo'
import { HandlerWrapper, HandlerWrapperLoggedIn } from '../../../utils'

export type ManageVillageItemData =
  | { action: 'create'; name: string }
  | { action: 'rename'; villageId: string; name: string }
  | { action: 'delete'; villageId: string }
  | { action: 'assign'; villageId: string; userId: string }
  | { action: 'unassign'; villageId: string; userId: string }

export const manageVillages = HandlerWrapperLoggedIn<{}, ManageVillageItemData>(
  (req, res) => ['manageVillages', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const villageQueryData = await DBVillage.get({ eventId: res.locals.event.eventId }).go()

      const villageData: TVillages = villageQueryData.data || { eventId: res.locals.event.eventId, villages: [] }

      if (req.body.action === 'create') {
        villageData.villages.push({
          name: req.body.name,
          id: v7(),
          bookings: [],
        })
      } else if (req.body.action === 'rename') {
        const { villageId, name } = req.body as Extract<ManageVillageItemData, { action: 'rename' }>
        const village = villageData.villages.find((village) => village.id === villageId)

        if (!village) {
          throw new Error('Village not found')
        }

        village.name = name
      } else if (req.body.action === 'delete') {
        const { villageId } = req.body as Extract<ManageVillageItemData, { action: 'delete' }>
        const villageIndex = villageData.villages.findIndex((village) => village.id === villageId)

        if (villageIndex === -1) {
          throw new Error('Village not found')
        }

        villageData.villages.splice(villageIndex, 1)
      } else if (req.body.action === 'assign') {
        const { villageId, userId } = req.body as Extract<ManageVillageItemData, { action: 'assign' }>
        const village = villageData.villages.find((village) => village.id === villageId)

        if (!village) {
          throw new Error('Village not found')
        }

        if (!village.bookings.includes(userId)) {
          village.bookings.push(userId)
        }
      } else if (req.body.action === 'unassign') {
        const { villageId, userId } = req.body as Extract<ManageVillageItemData, { action: 'unassign' }>
        const village = villageData.villages.find((village) => village.id === villageId)

        if (!village) {
          throw new Error('Village not found')
        }

        const bookingIndex = village.bookings.findIndex((b) => b === userId)
        if (bookingIndex !== -1) {
          village.bookings.splice(bookingIndex, 1)
        }
      } else {
        throw new Error('Invalid action')
      }

      const parsed = VillagesSchema.parse(villageData)
      await DBVillage.put(parsed).go()
      res.json({ parsed })
    } catch (e: any) {
      res.status(400).json({ message: e.message })
      return
    }
  },
)
