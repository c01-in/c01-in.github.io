import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "@/pages/Home";
import KnowledgeBase from "@/pages/KnowledgeBase";
import MarkdownReader from "@/pages/MarkdownReader";
import KotlinPlayground from "@/pages/KotlinPlayground";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="bg-background text-foreground dark:bg-foreground dark:text-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kb" element={<KnowledgeBase />} />
          <Route path="/read/:filename" element={<MarkdownReader />} />
          <Route path="/kotlin" element={<KotlinPlayground />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>
);
