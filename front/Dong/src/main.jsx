import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// adjust path if your ExpenseContext is in components
import { ExpenseProvider } from "./components/ExpenseContext";
import { ThemeProvider } from "./components/ThemeContext";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <ExpenseProvider>
        <App />
      </ExpenseProvider>
    </ThemeProvider>
  </React.StrictMode>
);
