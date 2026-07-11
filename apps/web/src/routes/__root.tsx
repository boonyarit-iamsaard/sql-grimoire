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

  return (
    <div className="min-h-full motion-safe:animate-page-fade" key={pathname}>
      <Outlet />
    </div>
  );
}
