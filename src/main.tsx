import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const root = document.getElementById("root")!;
const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

if (!convexUrl) {
  createRoot(root).render(
    <div style={{padding: 24, fontFamily: 'system-ui'}}>
      Missing configuration: set VITE_CONVEX_URL in your environment and redeploy.
    </div>
  );
} else {
  const convex = new ConvexReactClient(convexUrl);
  createRoot(root).render(
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>,
  );
}
