"use client";
import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

interface BackButtonProps {
  children?: ReactNode;
}

const BackButton: React.FC<BackButtonProps> = ({ children }) => {
  const router = useRouter();
  return (
    <div className="cursor-pointer flex items-center text-sm" onClick={() => router.back()}>
      <ChevronLeftIcon className="h-4" />
      <span>{children}</span>
    </div>
  );
};

export default BackButton;
