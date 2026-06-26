import { Routes, Route } from "react-router-dom";

import { AppLayout } from "@/app/layouts";
import { NotFound } from "@/app/not-found";

import { StreamsPage } from "@/features/streams";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="*" element={<StreamsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
