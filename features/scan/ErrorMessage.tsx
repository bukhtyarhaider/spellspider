import React from "react";
import { Alert } from "../../components/ui";

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
}) => {
  return (
    <Alert
      variant="error"
      title="Error"
      dismissible={!!onDismiss}
      onDismiss={onDismiss}
    >
      {message}
    </Alert>
  );
};
