import { createHashHistory, createRouter } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  // Wraps route changes in document.startViewTransition where supported; the
  // crossfade itself is styled in styles.css (::view-transition-*). Browsers
  // without support navigate instantly and keep the route-fade fallback.
  defaultViewTransition: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
