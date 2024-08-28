import React, { useEffect, useState } from "react";
import { XCircleIcon } from "@heroicons/react/20/solid";

type AlertProps = {
  type: string;
  message: string;
  onClose?: () => void;
};

import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setVisible(false);
      onClose && onClose();
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onClose]);

  const handleDismiss = () => {
    setVisible(false);
    onClose && onClose();
  };
  return (
    <div
      className={`${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
      } transition-transform duration-500 ease-in-out transform fixed top-20 flex justify-center w-full z-50`}
    >
      <div
        className={`rounded-md w-9/12 ${
          type === "success" ? "bg-green-50" : "bg-red-50"
        } p-4`}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            {type === "success" ? (
              <CheckCircleIcon
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            ) : (
              <XCircleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 ${
                  type === "success"
                    ? "text-green-500 hover:bg-green-100 hover:border-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                    : "text-red-500 hover:bg-red-100 hover:border-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                } `}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon
                  onClick={handleDismiss}
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
