import { diff, IChange } from 'json-diff-ts'

import { TBooking } from './schemas/booking'

export const generateDiscordDiff: (oldBooking: TBooking, newBooking: TBooking) => string[] = (oldBooking, newBooking) => {
  const replacements: Record<string, string> = {
    basic: 'Basic',
    participants: 'Campers',
    bookingType: 'Type',
    emergency: 'Emergency Contact',
    camping: 'Camping',
    travel: 'Travel',
    howDidYouHear: 'How did you hear',
    campsWith: 'Camping preference',
    canBringEquipment: 'Camping Equipment',
    attendance: 'Attendance',
    kp: 'Dietary Requirements',
    medical: 'Medical & Accessibility',
    consent: 'Consents',
    extraContacts: 'Extra Contacts',
    district: 'District',
    contactName: 'Contact Name',
    contactEmail: 'Contact Email',
    contactPhone: 'Contact Phone',
    email: 'Email',
    dob: 'Date of Birth',
    accessibilityNeeds: 'Accessibility Needs',
  }

  const updateString = (updateItem: IChange, stack: IChange[]) => {
    if (['extraFeeData'].includes(updateItem.key)) return
    if (updateItem.changes) {
      updateItem.changes.forEach((c) => {
        updateString(c, [...stack, updateItem])
      })
      return
    }
    if (['version', 'created', 'updated'].includes(updateItem.key)) return

    const capitalise = (string: string) => {
      return string[0].toUpperCase() + string.slice(1).toLowerCase()
    }

    let chain = [...stack, updateItem]
    if (chain.length == 4 && chain[0].key == 'people' && chain[2].key !== 'basic') {
      updateItem = chain.pop() as IChange
    }
    const updateType = typeof updateItem.value === 'boolean' ? 'Update' : capitalise(updateItem.type)
    const string = `${updateType}: ${chain.map((u) => (replacements[u.key] ? replacements[u.key] : u.key)).join(' -> ')}`
    updateStrings.push(string)
  }

  const updateStrings: string[] = []

  const existingLatestBookingDiscord = {
    ...oldBooking,
    people: (oldBooking.people || []).filter((p) => p.basic?.name && p.basic?.dob).map((p) => ({ ...p, name: p.basic?.name.trim(), basic: { ...p.basic, name: p.basic.name.trim() } })),
  }
  //@ts-ignore
  const newLatestBookingDiscord = {
    ...newBooking,
    people: (newBooking.people || []).filter((p) => p.basic?.name && p.basic?.dob).map((p) => ({ ...p, name: p.basic?.name.trim(), basic: { ...p.basic, name: p.basic.name.trim() } })),
  }

  const updates = diff(existingLatestBookingDiscord, newLatestBookingDiscord, { embeddedObjKeys: { people: 'name' } })
  updates.forEach((u) => {
    updateString(u, [])
  })

  const uniqueUpdateStrings = [...new Set(updateStrings)]

  return updates.length > 0 ? uniqueUpdateStrings : []
}
