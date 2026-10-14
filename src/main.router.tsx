import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "@/pages/Home";
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const MarkdownReader = lazy(() => import("@/pages/MarkdownReader"));
const KotlinPlayground = lazy(() => import("@/pages/KotlinPlayground"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="bg-background text-foreground dark:bg-foreground dark:text-background">
        <Suspense fallback={<div role="status" className="min-h-screen grid place-items-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kb" element={<KnowledgeBase />} />
            <Route path="/read/:filename" element={<MarkdownReader />} />
            <Route path="/kotlin" element={<KotlinPlayground />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  </StrictMode>
);
