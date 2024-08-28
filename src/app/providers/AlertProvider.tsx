"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import Alert from "../components/ui/shared/alert";

interface AlertContextProps {
  children: ReactNode;
}

interface Alert {
  type: string;
  message: string;
}

type ShowAlertFunction = (type: string, message: string) => void;

const AlertContext = createContext<ShowAlertFunction | undefined>(undefined);

export const AlertProvider: React.FC<AlertContextProps> = ({ children }) => {
  const [alert, setAlert] = useState<Alert | null>(null);

  const showAlert: ShowAlertFunction = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 3000); // Auto-dismiss after 3 seconds
  };

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      {alert && <Alert type={alert.type} message={alert.message} />}
    </AlertContext.Provider>
  );
};

export const useAlert = (): ShowAlertFunction => {
  const showAlert = useContext(AlertContext);
  if (!showAlert) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return showAlert;
};
