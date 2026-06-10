import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/test-context")({
  component: TestContext,
});

function TestContext() {
  const context = Route.useRouteContext();
  return (
    <div>
      <h1>Context Debug</h1>
      <pre>{JSON.stringify(Object.keys(context), null, 2)}</pre>
    </div>
  );
}
