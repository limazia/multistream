import { useCallback } from "react";

import { cn } from "@/shared/utils/cn";

import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";

import { useUsers } from "./hooks/use-users";
import {
  UsersErrorAlert,
  UsersList,
  UsersListSkeleton,
  UsersQueryStatus,
} from "./components";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Erro desconhecido ao buscar usuários.";
}

export function HomePage() {
  const {
    users,
    isLoadingUsers,
    isFetchingUsers,
    isErrorUsers,
    usersError,
    refetchUsers,
  } = useUsers();

  const userCount = users?.length ?? 0;

  const handleRefetch = useCallback(() => {
    void refetchUsers();
  }, [refetchUsers]);

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-bold text-foreground">
              Usuários
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Página de demonstração com estados do React Query (
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                useUsers
              </code>
              ): carregamento, refetch, erro validado com Zod e lista em cards.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={isLoadingUsers}
            onClick={handleRefetch}
          >
            {isFetchingUsers ? "Atualizando…" : "Recarregar lista"}
          </Button>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Estado da query
          </h2>
          <UsersQueryStatus
            isLoadingUsers={isLoadingUsers}
            isFetchingUsers={isFetchingUsers}
            isErrorUsers={isErrorUsers}
            userCount={userCount}
          />
        </section>

        {isErrorUsers ? (
          <UsersErrorAlert message={getErrorMessage(usersError)} />
        ) : null}

        {isLoadingUsers && !users ? (
          <div className="space-y-4 rounded-xl border border-dashed border-border bg-card/30 p-4">
            <p className="text-sm text-muted-foreground">
              Carregando usuários (primeira carga)…
            </p>
            <UsersListSkeleton count={6} />
          </div>
        ) : null}

        {users && !isErrorUsers ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Lista ({userCount})
              </h2>
              {isFetchingUsers && !isLoadingUsers ? (
                <div className="flex items-center gap-2" aria-live="polite">
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="hidden h-3 w-24 sm:block" />
                </div>
              ) : null}
            </div>
            <div className="relative min-h-48">
              <div
                className={cn(
                  isFetchingUsers &&
                    !isLoadingUsers &&
                    "pointer-events-none opacity-40",
                )}
              >
                <UsersList users={users} />
              </div>
              {isFetchingUsers && !isLoadingUsers ? (
                <div
                  className="absolute inset-0 z-10 overflow-hidden rounded-lg border border-border/60 bg-background/80 p-2 backdrop-blur-[2px]"
                  aria-busy
                  aria-label="Atualizando lista de usuários"
                >
                  <UsersListSkeleton
                    count={Math.min(Math.max(userCount, 1), 9)}
                  />
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
