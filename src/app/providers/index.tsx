import { BrowserRouter } from "react-router-dom";

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
