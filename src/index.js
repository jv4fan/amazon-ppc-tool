import React from "react";
import { createRoot } from "react-dom/client";
import AmazonPpcOptimizationTool from "./AmazonPpcOptimizationTool";
import "./styles.css";

// Create a root
const root = createRoot(document.getElementById("root"));

// Render your app
root.render(
  <React.StrictMode>
    <AmazonPpcOptimizationTool />
  </React.StrictMode>
);
