import {
  createRootRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({
    select: ({ location }) => location.pathname,
  });

  // route-fade is the fallback entry for browsers without the View
  // Transitions API; when view transitions run (styles.css), the fallback is
  // suppressed so the new page doesn't fade in twice.
  return (
    <div
      className="min-h-full motion-safe:not-supports-[view-transition-name:none]:animate-route-fade"
      key={pathname}
    >
      <Outlet />
    </div>
  );
}
