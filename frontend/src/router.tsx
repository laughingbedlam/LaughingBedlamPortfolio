/**
 * router.tsx
 * App routes (public + professional + admin).
 */
import React from "react";
import { createBrowserRouter } from "react-router-dom";

import { Shell } from "./components/layout/Shell";
import LandingPage from "./pages/LandingPage";
import GalleryPage from "./pages/GalleryPage";
import ArtDetailPage from "./pages/ArtDetailPage";
import ProHomePage from "./pages/ProHomePage";
import WritingLibraryPage from "./pages/WritingLibraryPage";
import WritingDetailPage from "./pages/WritingDetailPage";
import MediaPage from "./pages/MediaPage";
import ContactPage from "./pages/ContactPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { AdminGuard } from "./components/admin/AdminGuard";

export const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: "/", element: <LandingPage /> },

      { path: "/gallery", element: <GalleryPage /> },
      { path: "/gallery/:id", element: <ArtDetailPage /> },

      // Existing pro routes
      { path: "/pro", element: <ProHomePage /> },
      { path: "/pro/writing", element: <WritingLibraryPage /> },
      { path: "/pro/writing/:id", element: <WritingDetailPage /> },

      // ✅ Alias routes so nav or landing links to /professional won’t 404
      { path: "/professional", element: <ProHomePage /> },
      { path: "/professional/writing", element: <WritingLibraryPage /> },
      { path: "/professional/writing/:id", element: <WritingDetailPage /> },

      { path: "/media", element: <MediaPage /> },
      { path: "/contact", element: <ContactPage /> },

      { path: "/admin/login", element: <AdminLoginPage /> },
      {
        path: "/admin",
        element: (
          <AdminGuard>
            <AdminDashboardPage />
          </AdminGuard>
        )
      }
    ]
  }
]);
