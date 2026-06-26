import { AppProviders } from "./providers";
import { AppRoutes } from "./router";
import { ErrorLayout } from "./layouts/error.layout";
import { envIsValid, getEnvIssues } from "@/shared/utils/env";

export function App() {
  if (!envIsValid) {
    return (
      <ErrorLayout
        title="Configuração de ambiente incompleta ou inválida"
        description="Variáveis obrigatórias do .env estão ausentes ou incorretas."
        invalidParams={getEnvIssues()}
      />
    );
  }

  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
