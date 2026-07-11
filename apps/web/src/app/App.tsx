import { Outlet, useLocation } from "react-router-dom";

export function App() {
  const location = useLocation();
  // Keying on pathname re-mounts the page so the fade-in transition replays.
  return (
    <div className="app-root" key={location.pathname}>
      <Outlet />
    </div>
  );
}
