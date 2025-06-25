import { nameRegex, numberRegex } from "@/constants/regex";
import z from "zod";

// Participant update form validation schema
export const formSchemaParticipant = z.object({
    pname: z
        .string()
        .regex(nameRegex, "Enter a valid name")
        .nonempty("Name is required"),
    pnumber: z
        .string()
        .regex(numberRegex, "Enter a valid 10 digits phone number")
        .nonempty("Phone number is required"),
    prole: z.string().nonempty("Role is required"),
});

// Form type based on schema
export type FormTypeParticipant = z.infer<typeof formSchemaParticipant>;
