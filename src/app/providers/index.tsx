import { setDefaultOptions } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BrowserRouter } from "react-router-dom";

setDefaultOptions({ locale: ptBR });

import { ComposeProviders, Toaster, TooltipProvider } from "@components";

const OuterProviders = ComposeProviders([BrowserRouter]);
const InnerProviders = ComposeProviders([TooltipProvider, TooltipProvider]);

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <OuterProviders>
      <InnerProviders>
        {children}

        <Toaster
          position="top-right"
          closeButton={false}
          duration={5000}
          toastOptions={{
            duration: 5000,
          }}
          expand
        />
      </InnerProviders>
    </OuterProviders>
  );
}
