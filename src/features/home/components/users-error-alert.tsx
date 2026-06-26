import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";

interface UsersErrorAlertProps {
  message: string;
}

export function UsersErrorAlert({ message }: UsersErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>Não foi possível carregar os usuários</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
