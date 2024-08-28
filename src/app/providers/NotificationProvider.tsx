"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import Notification from "../components/ui/shared/Notification";

interface NotificationContextProps {
  children: ReactNode;
}

interface Notification {
  type: string;
  message: string;
}

type ShowNotificationFunction = (type: string, message: string) => void;

const NotificationContext = createContext<ShowNotificationFunction | undefined>(
  undefined
);

export const NotificationProvider: React.FC<NotificationContextProps> = ({
  children,
}) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification: ShowNotificationFunction = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000); // Auto-dismiss after 3 seconds
  };

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): ShowNotificationFunction => {
  const showNotification = useContext(NotificationContext);
  if (!showNotification) {
    throw new Error(
      "useNotification must be used within an NotificationProvider"
    );
  }
  return showNotification;
};
