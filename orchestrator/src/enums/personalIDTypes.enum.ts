import { execPath } from "node:process"

enum PersonalIDTypes {
    Passport = "passport",
    NationalID = "national_id",
}

export default PersonalIDTypes

export const PersonalIDTypesValues = Object.values(PersonalIDTypes) as string[];