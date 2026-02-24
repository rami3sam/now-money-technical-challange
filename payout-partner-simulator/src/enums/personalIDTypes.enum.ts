import { execPath } from "node:process"

enum PersonalIDTypes {
    Passport = "PASSPORT",
    NationalID = "NATIONAL_ID",
}

export default PersonalIDTypes

export const PersonalIDTypesValues = Object.values(PersonalIDTypes) as string[];