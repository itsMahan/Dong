import React, { createContext, useState, useEffect, useCallback } from "react";
import apiClient, { setupInterceptors } from "../api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  useEffect(() => {
    setupInterceptors(logout);
  }, [logout]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
