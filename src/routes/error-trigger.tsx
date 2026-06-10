import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/error-trigger")({
  component: () => {
    throw new Error("Forced runtime error for auditing");
  },
});
