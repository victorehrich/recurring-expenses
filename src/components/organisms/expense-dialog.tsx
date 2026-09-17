"use client";

import * as React from "react";
import { Dialog } from "./dialog";

export function ExpenseDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog title={title} onClose={onClose} wide>
      {children}
    </Dialog>
  );
}
