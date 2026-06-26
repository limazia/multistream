import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

interface InvalidParam {
  name: string;
  expected?: string;
  received?: string;
}

interface ErrorLayoutProps {
  title?: string;
  description?: string;
  invalidParams?: InvalidParam[];
}

export function ErrorLayout({
  title = "Parâmetros inválidos ou ausentes",
  description = "Variáveis obrigatórias do .env estão ausentes ou incorretas.",
  invalidParams = [],
}: ErrorLayoutProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-5 text-destructive" />
          </div>

          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>

          {invalidParams.length > 0 && (
            <ul className="space-y-2">
              {invalidParams.map((param) => (
                <li
                  key={param.name}
                  className="rounded-md border border-border bg-muted/40 p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Parâmetro</span>

                    <code className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 font-mono text-xs font-semibold text-destructive">
                      {param.name}
                    </code>
                  </div>

                  {param.expected && (
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Esperado</span>

                      <code className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs font-medium text-foreground">
                        {param.expected}
                      </code>
                    </div>
                  )}

                  {param.received !== undefined && (
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Recebido</span>

                      <code className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                        {param.received || "—"}
                      </code>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
