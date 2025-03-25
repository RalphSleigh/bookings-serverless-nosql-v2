import { Entity } from "electrodb";
import { am_in_lambda } from "./utils";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamodbClientOptions = am_in_lambda() ? { region: 'eu-west-2' } : { region: 'eu-west-2', endpoint: 'http://localhost:8000' }
const client = new DynamoDBClient(dynamodbClientOptions)

const table = "Booking";

export const User = new Entity(
    {
        model: {
            entity: "user",
            version: "1",
            service: "bookings",
        },
        attributes: {
            sub: {
                type: "string",
                required: true,
            },
            name: {
                type: "string",
            },
            email: {
                type: "string",
            }
        },
        indexes: {
            bySub: {
                pk: {
                    // highlight-next-line
                    field: "pk",
                    composite: [],
                },
                sk: {
                    // highlight-next-line
                    field: "sk",
                    composite: ["sub"],
                },
            },
        },
    },
    { client, table },
);