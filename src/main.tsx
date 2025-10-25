import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// ⬇️ use your page instead of App for now
import Home from "@/pages/Home";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
