import type { ComponentType, ReactNode } from "react";

type Provider = ComponentType<{ children: ReactNode }>;

/**
 * Compõe múltiplos providers em um único componente
 * para evitar o "Provider Hell" no App.
 */
export function ComposeProviders(providers: Provider[]) {
  return function ComposedProviders({ children }: { children: ReactNode }) {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );
  };
}
