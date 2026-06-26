import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <main className="h-full min-h-0 overflow-hidden">
      <Outlet />
    </main>
  );
}
