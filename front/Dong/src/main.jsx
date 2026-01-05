import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
// adjust path if your ExpenseContext is in components
import { ExpenseProvider } from "./components/ExpenseContext";
import { ThemeProvider } from "./components/ThemeContext";
import { UserProvider } from "./components/UserContext"; // Import UserProvider
import "./App.css";
import "./i18n";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider>
          <ExpenseProvider>
            <App />
          </ExpenseProvider>
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
