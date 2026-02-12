import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import App from "./App";
// adjust path if your ExpenseContext is in components
import { ExpenseProvider } from "./components/ExpenseContext";
import { ThemeProvider } from "./components/ThemeContext";
import { UserProvider } from "./components/UserContext"; // Import UserProvider
import "./App.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <ThemeProvider>
          <UserProvider>
            <ExpenseProvider>
              <App />
            </ExpenseProvider>
          </UserProvider>
        </ThemeProvider>
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>
);
