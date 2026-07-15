import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { PersonalSettingsPage } from "./PersonalSettingsPage";

const PersonalSettingsSearchSchema = z.object({
  sessionSearch: z.string().optional()
});

export const Route = createFileRoute("/_authenticate/personal-settings/_layout/")({
  component: PersonalSettingsPage,
  validateSearch: zodValidator(PersonalSettingsSearchSchema)
});
