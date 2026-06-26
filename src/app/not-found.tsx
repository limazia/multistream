import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { notFound } from "@/assets";
import { Button } from "@components/ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <DotLottieReact data={JSON.stringify(notFound)} loop autoplay />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto">
            Ops! Parece que você se perdeu. A página que você está procurando
            não existe ou foi movida.
          </p>
        </div>

        <div className="pt-4">
          <Button asChild variant={"link"} className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Link>
          </Button>
        </div>

        <div className="pt-8 flex items-center justify-center gap-1">
          <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          <div className="h-1 w-2 rounded-full bg-muted-foreground/30" />
          <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
    </div>
  );
}
