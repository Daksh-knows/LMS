"use client";
import React, { createContext, useContext, useState } from "react";
import { ConfirmModal } from "@/components/modals/ConfirmModal";

const ConfirmContext = createContext<any>(null);

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState({ isOpen: false, title: "", message: "", onConfirm: () => {} });
  const [loading, setLoading] = useState(false);

  const confirm = (title: string, message: string, onConfirm: () => Promise<void> | void) => {
    setState({ isOpen: true, title, message, onConfirm });
  };

  const close = () => { if (!loading) setState((prev) => ({ ...prev, isOpen: false })); };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await state.onConfirm(); // Execute the passed function
      setState((prev) => ({ ...prev, isOpen: false })); // Close on success
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal 
        {...state} 
        loading={loading} 
        onClose={close} 
        onConfirm={handleConfirm} 
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);