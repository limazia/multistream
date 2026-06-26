import { Routes, Route } from "react-router-dom";

import { AppLayout } from "@/app/layouts";
import { NotFound } from "@/app/not-found";

import { HomePage } from "@/features/home";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
