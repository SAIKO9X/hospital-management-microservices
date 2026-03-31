import { useState } from "react";

type ActionNotification = {
  variant: "success" | "error";
  title: string;
} | null;

export const useActionNotification = () => {
  const [notification, setNotification] = useState<ActionNotification>(null);

  const notify = (variant: "success" | "error", title: string) =>
    setNotification({ variant, title });

  const dismiss = () => setNotification(null);

  return { notification, notify, dismiss };
};
