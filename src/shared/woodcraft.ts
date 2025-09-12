import dayjs from "dayjs";
import { TEvent } from "./schemas/event";
import { TPerson } from "./schemas/person";

type AgeGroup = {
    singular: string;
    plural: string;
    filter: (age: number) => boolean;
}

export const ageGroups: AgeGroup[] = [
    {
        singular: "Woodchip",
        plural: "Woodchips",
        filter: (age: number) => age < 6,
    },
    {
        singular: "Elfin",
        plural: "Elfins",
        filter: (age: number) => age >= 6 && age < 10,
    },
    {
        singular: "Pioneer",
        plural: "Pioneers",
        filter: (age: number) => age >= 10 && age < 13,
    },
    {
        singular: "Venturer",
        plural: "Venturers",
        filter: (age: number) => age >= 13 && age < 16,
    },
    {
        singular: "DF (u18)",
        plural: "DFs (u18)",
        filter: (age: number) => age >= 16 && age < 18, 
    },
    {
        singular: "DF (18+)",
        plural: "DFs (18+)",
        filter: (age: number) => age >= 18 && age < 21,
    },
    {
        singular: "Adult",
        plural: "Adults",
        filter: (age: number) => age >= 21,
    },
]

export const ageGroupFromPerson = (event: TEvent) => (person: TPerson): AgeGroup=> {
    const age = dayjs(event.endDate).diff(dayjs(person.basic.dob), 'year');
    const ageGroup = ageGroups.find(ag => ag.filter(age))
    return ageGroup || ageGroups[ageGroups.length - 1];
}