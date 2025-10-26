import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { convex } from "./convexClient";
import { ConvexProvider } from "convex/react";

createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>,
);
