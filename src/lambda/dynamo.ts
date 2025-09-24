import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Attributes, Entity, Service, type EntityItem } from 'electrodb'
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid'

import { KPBasicOptions } from '../shared/kp/kp'
import { am_in_lambda } from './utils'

const dynamodbClientOptions = am_in_lambda() ? { region: 'eu-west-2' } : { region: 'eu-west-2', endpoint: 'http://localhost:8000' }
const client = new DynamoDBClient(dynamodbClientOptions)

const table = 'Bookings'

export const DBUser = new Entity(
  {
    model: {
      entity: 'user',
      version: '1',
      service: 'bookings',
    },
    attributes: {
      userId: {
        type: 'string',
        required: true,
        default: () => uuidv4(),
      },
      sub: {
        type: 'string',
        required: true,
      },
      name: {
        type: 'string',
        required: true,
      },
      email: {
        type: 'string',
        required: true,
      },
      avatar: {
        type: 'string',
      },
      isWoodcraft: {
        type: 'boolean',
        required: true,
      },
      isGroupAccount: {
        type: 'boolean',
        required: true,
      },
    },
    indexes: {
      bySub: {
        pk: {
          field: 'pk',
          composite: [],
        },
        sk: {
          field: 'sk',
          composite: ['sub'],
        },
      },
      byUserId: {
        collection: 'userWithRoles',
        index: 'gsi1pk-gsi1sk-index',
        pk: {
          field: 'gsi1pk',
          composite: ['userId'],
        },
        sk: {
          field: 'gsi1sk',
          composite: [],
        },
      },
    },
  },
  { client, table },
)

export const DBRole = new Entity(
  {
    model: {
      entity: 'role',
      version: '1',
      service: 'bookings',
    },
    attributes: {
      roleId: {
        type: 'string',
        required: true,
        default: () => uuidv4(),
      },
      userId: {
        type: 'string',
        required: true,
      },
      role: {
        type: ['admin', 'owner'] as const,
        required: true,
      },
      eventId: {
        type: 'string',
        required: true,
        default: 'global',
      },
    },
    indexes: {
      natural: {
        pk: {
          field: 'pk',
          composite: [],
        },
        sk: {
          field: 'sk',
          composite: ['eventId', 'roleId'],
        },
      },
      byUserId: {
        index: 'gsi1pk-gsi1sk-index',
        collection: 'userWithRoles',
        pk: {
          field: 'gsi1pk',
          composite: ['userId'],
        },
        sk: {
          field: 'gsi1sk',
          composite: [],
        },
      },
    },
  },
  { client, table },
)

export const DBEvent = new Entity(
  {
    model: {
      entity: 'event',
      version: '1',
      service: 'bookings',
    },
    attributes: {
      eventId: {
        type: 'string',
        required: true,
        default: () => uuidv4(),
      },
      name: {
        type: 'string',
        required: true,
      },
      description: {
        type: 'string',
        required: true,
      },
      startDate: {
        type: 'string',
        required: true,
      },
      endDate: {
        type: 'string',
        required: true,
      },
      bookingDeadline: {
        type: 'string',
        required: true,
      },
      fee: {
        type: 'map',
        properties: {
          feeStructure: {
            type: ['free', 'ealing'] as const,
            required: true,
          },
          ealingData: {
            type: 'map',
            properties: {
              accompanied: {
                type: 'number',
                required: true,
              },
              unaccompanied: {
                type: 'number',
                required: true,
              },
              accompaniedDiscount: {
                type: 'number',
                required: true,
              },
              unaccompaniedDiscount: {
                type: 'number',
                required: true,
              },
              paymentInstructions: {
                type: 'string',
                required: true,
              },
            },
          },
        },
      },
      kp: {
        type: 'map',
        properties: {
          kpStructure: {
            type: ['basic', 'large'] as const,
            required: true,
          },
        },
      },
      consents: {
        type: 'map',
        properties: {
          consentsStructure: {
            type: ['none', 'large'] as const,
            required: true,
          },
        },
      },
      attendance: {
        type: 'map',
        properties: {
          attendanceStructure: {
            type: ['whole'] as const,
            required: true,
          },
        },
      },
      emailSubjectTag: {
        type: 'string',
        required: true,
      },
      replyTo: {
        type: 'string',
        required: true,
      },
      bigCampMode: {
        type: 'boolean',
        required: true,
      },
      applicationsRequired: {
        type: 'boolean',
        required: true,
      },
      allParticipantEmails: {
        type: 'boolean',
        required: true,
      },
      howDidYouHear: {
        type: 'boolean',
        required: true,
      },
      customQuestions: {
        type: 'list',
        items: {
          type: 'map',
          properties: {
            questionType: {
              type: ['yesnochoice', 'text', 'longtext'] as const,
              required: true,
            },
            questionLabel: {
              type: 'string',
              required: true,
            },
          },
        },
      },
    },
    indexes: {
      natural: {
        pk: {
          field: 'pk',
          composite: [],
        },
        sk: {
          field: 'sk',
          composite: ['eventId'],
        },
      },
    },
  },
  { client, table },
)

const BookingAttributes = {
  userId: {
    type: 'string',
    required: true,
  },
  eventId: {
    type: 'string',
    required: true,
  },
  cancelled: {
    type: 'boolean',
    required: true,
    default: false,
  },
  basic: {
    type: 'map',
    properties: {
      name: { type: 'string', required: true },
      email: { type: 'string', required: true },
      telephone: { type: 'string', required: true },
      organisation: { type: 'string' },
      district: { type: 'string' },
      type: {
        type: ['individual', 'group'] as const,
      },
    },
  },
  extraContacts: {
    type: 'list',
    items: {
      type: 'map',
      properties: {
        name: { type: 'string', required: true },
        email: { type: 'string', required: true },
      },
    },
  },
  other: {
    type: 'map',
    properties: {
      anythingElse: {
        type: 'string',
        required: false,
      },
      whatsApp: {
        type: ['yes', 'no'] as const,
        required: false,
      },
    },
  },
} as const

export const DBBooking = new Entity(
  {
    model: {
      entity: 'booking',
      version: '1',
      service: 'bookings',
    },
    attributes: {
      ...BookingAttributes,
      createdAt: {
        type: 'number',
        readOnly: true,
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
      },
      updatedAt: {
        type: 'number',
        watch: '*',
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
      },
    },
    indexes: {
      natural: {
        collection: 'booking',
        type: 'clustered',
        pk: {
          field: 'pk',
          composite: ['eventId'],
        },
        sk: {
          field: 'sk',
          composite: ['userId'],
        },
      },
      byUserId: {
        collection: 'bookingByUserId',
        index: 'gsi1pk-gsi1sk-index',
        type: 'clustered',
        pk: {
          field: 'gsi1pk',
          composite: ['userId'],
        },
        sk: {
          field: 'gsi1sk',
          composite: ['eventId'],
        },
      },
    },
  },
  { client, table },
)

export const DBBookingHistory = new Entity(
  {
    model: {
      entity: 'bookingHistory',
      version: '1',
      service: 'bookings',
    },
    attributes: {
      userId: {
        type: 'string',
        required: true,
      },
      eventId: {
        type: 'string',
        required: true,
      },
      versions: {
        required: true,
        type: 'list',
        items: {
          type: 'map',
          properties: {
            ...BookingAttributes,
            createdAt: {
              type: 'number',
              readOnly: true,
              required: true,
            },
            updatedAt: {
              type: 'number',
              readOnly: true,
              required: true,
            },
          },
        },
      },
      createdAt: {
        type: 'number',
        readOnly: true,
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
      },
      updatedAt: {
        type: 'number',
        watch: '*',
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
      },
    },
    indexes: {
      natural: {
        collection: 'bookingHistory',
        type: 'clustered',
        pk: {
          field: 'pk',
          composite: ['eventId'],
        },
        sk: {
          field: 'sk',
          composite: ['userId'],
        },
      },
      byUserId: {
        index: 'gsi1pk-gsi1sk-index',
        collection: 'bookingHistoryByUserId',
        type: 'clustered',
        pk: {
          field: 'gsi1pk',
          composite: ['userId'],
        },
        sk: {
          field: 'gsi1sk',
          composite: ['eventId'],
        },
      },
    },
  },
  { client, table },
)

const PersonAttributes = {
  personId: {
    type: 'string',
    required: true,
    default: () => uuidv4(),
  },
  userId: {
    type: 'string',
    required: true,
  },
  eventId: {
    type: 'string',
    required: true,
  },
  cancelled: {
    type: 'boolean',
    required: true,
    default: false,
  },
  basic: {
    type: 'map',
    properties: {
      name: { type: 'string', required: true },
      dob: { type: 'string', required: true },
      email: { type: 'string' },
    },
  },
  kp: {
    type: 'map',
    properties: {
      diet: { type: KPBasicOptions, required: true },
      details: { type: 'string' },
    },
  },
  health: {
    type: 'map',
    properties: {
      medical: { type: 'string' },
    },
  },
} as const

export const DBPerson = new Entity(
  {
    model: {
      entity: 'person',
      version: '1',
      service: 'bookings',
    },
    attributes: {
      ...PersonAttributes,
      createdAt: {
        type: 'number',
        readOnly: true,
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
      },
      updatedAt: {
        type: 'number',
        watch: '*',
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
      },
    },
    indexes: {
      natural: {
        collection: 'booking',
        type: 'clustered',
        pk: {
          field: 'pk',
          composite: ['eventId'],
        },
        sk: {
          field: 'sk',
          composite: ['userId', 'personId'],
        },
      },
      byUserId: {
        collection: 'bookingByUserId',
        type: 'clustered',
        index: 'gsi1pk-gsi1sk-index',
        pk: {
          field: 'gsi1pk',
          composite: ['userId'],
        },
        sk: {
          field: 'gsi1sk',
          composite: ['eventId', 'personId'],
        },
      },
    },
  },
  { client, table },
)

export const DBPersonHistory = new Entity(
  {
    model: {
      entity: 'personHistory',
      version: '1',
      service: 'bookings',
    },
    attributes: {
      personId: {
        type: 'string',
        required: true,
      },
      userId: {
        type: 'string',
        required: true,
      },
      eventId: {
        type: 'string',
        required: true,
      },
      versions: {
        required: true,
        type: 'list',
        items: {
          type: 'map',
          properties: {
            ...PersonAttributes,
            createdAt: {
              type: 'number',
              readOnly: true,
              required: true,
            },
            updatedAt: {
              type: 'number',
              readOnly: true,
              required: true,
            },
          },
        },
      },
      createdAt: {
        type: 'number',
        readOnly: true,
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
      },
      updatedAt: {
        type: 'number',
        watch: '*',
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
      },
    },
    indexes: {
      natural: {
        collection: 'bookingHistory',
        type: 'clustered',
        pk: {
          field: 'pk',
          composite: ['eventId'],
        },
        sk: {
          field: 'sk',
          composite: ['userId', 'personId'],
        },
      },
      byUserId: {
        collection: 'bookingHistoryByUserId',
        index: 'gsi1pk-gsi1sk-index',
        type: 'clustered',
        pk: {
          field: 'gsi1pk',
          composite: ['userId'],
        },
        sk: {
          field: 'gsi1sk',
          composite: ['eventId', 'personId'],
        },
      },
    },
  },
  { client, table },
)

const FeeAttributes = {
  feeId: {
    type: 'string',
    required: true,
    default: () => uuidv7(),
  },
  type: {
    type: ['payment', 'adjustment'] as const,
  },
  userId: {
    type: 'string',
    required: true,
  },
  eventId: {
    type: 'string',
    required: true,
  },
  amount: {
    type: 'number',
    required: true,
  },
  note: {
    type: 'string',
  },
} as const

export const DBFee = new Entity(
  {
    model: {
      entity: 'fee',
      version: '1',
      service: 'bookings',
    },
    attributes: {
      ...FeeAttributes,
      createdAt: {
        type: 'number',
        readOnly: true,
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
      }
    },
    indexes: {
      natural: {
        collection: 'fee',
        type: 'clustered',
        pk: {
          field: 'pk',
          composite: ['eventId'],
        },
        sk: {
          field: 'sk',
          composite: ['feeId'],
        },
      },
      byUserId: {
        collection: 'bookingByUserId',
        type: 'clustered',
        index: 'gsi1pk-gsi1sk-index',
        pk: {
          field: 'gsi1pk',
          composite: ['userId'],
        },
        sk: {
          field: 'gsi1sk',
          composite: ['eventId', 'feeId'],
        },
      },
    },
  },
  { client, table },
)

export const DB = new Service({
  user: DBUser,
  role: DBRole,
  booking: DBBooking,
  bookingHistory: DBBookingHistory,
  person: DBPerson,
  personHistory: DBPersonHistory,
})
