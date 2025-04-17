import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Entity, Service, type EntityItem } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

import { EventSchema } from '../shared/schemas/event';
import { am_in_lambda } from './utils';

const dynamodbClientOptions = am_in_lambda() ? { region: 'eu-west-2' } : { region: 'eu-west-2', endpoint: 'http://localhost:8000' };
const client = new DynamoDBClient(dynamodbClientOptions);

const table = 'Booking';

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
      },
      email: {
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
          // highlight-next-line
          field: 'pk',
          composite: [],
        },
        sk: {
          // highlight-next-line
          field: 'sk',
          composite: ['sub'],
        },
      },
      byUserId: {
        collection: 'userWithRoles',
        index: 'ls1',
        pk: {
          // highlight-next-line
          field: 'pk',
          composite: [],
        },
        sk: {
          // highlight-next-line
          field: 'ls1',
          composite: ['userId'],
        },
      },
    },
  },
  { client, table },
);

export const DBRole = new Entity(
  {
    model: {
      entity: 'role',
      version: '1',
      service: 'bookings',
    },
    attributes: {
      userId: {
        type: 'string',
        required: true,
      },
      role: {
        type: ['admin'] as const,
        required: true,
      },
      eventId: {
        type: 'string',
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
          composite: ['userId'],
        },
      },
      byUserId: {
        index: 'ls1',
        collection: 'userWithRoles',
        pk: {
          field: 'pk',
          composite: [],
        },
        sk: {
          field: 'ls1',
          composite: ['userId'],
        },
      },
    },
  },
  { client, table },
);


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
        type:'map',
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
);

export const DB = new Service({
  user: DBUser,
  role: DBRole,
});
