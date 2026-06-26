import type { FormEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { CopyIcon, SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@components/ui/sheet";
import { cn } from "@utils/cn";

import { MAX_STREAMS } from "../lib/grid-config";
import { buildPathFromStreams } from "../lib/stream-path";
import { useStreamStore } from "../hooks/use-stream-store";

import { LayoutMap } from "./layout-map";
import { StreamUrlRow } from "./stream-url-row";

export function StreamSettingsSheet() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const layoutInteractionRef = useRef(false);

  const sheetOpen = useStreamStore((state) => state.sheetOpen);
  const setSheetOpen = useStreamStore((state) => state.setSheetOpen);
  const streams = useStreamStore((state) => state.streams);
  const addStream = useStreamStore((state) => state.addStream);
  const clearStreams = useStreamStore((state) => state.clearStreams);

  const shareUrl = useMemo(() => {
    if (streams.length === 0) return null;
    return `${window.location.origin}${buildPathFromStreams(streams)}`;
  }, [streams]);

  const handleCopyShareUrl = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  }, [shareUrl]);

  const atStreamLimit = streams.length >= MAX_STREAMS;

  const resetAddForm = useCallback(() => {
    setUrl("");
    setError(null);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetAddForm();
      setSheetOpen(nextOpen);
    },
    [resetAddForm, setSheetOpen],
  );

  const handleLayoutInteractionChange = useCallback((active: boolean) => {
    layoutInteractionRef.current = active;
  }, []);

  const handleDismissOutside = useCallback((event: Event) => {
    if (layoutInteractionRef.current) {
      event.preventDefault();
    }
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const result = addStream(url);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      resetAddForm();
    },
    [addStream, resetAddForm, url],
  );

  const handleClearAll = useCallback(() => {
    clearStreams();
    resetAddForm();
    setSheetOpen(false);
  }, [clearStreams, resetAddForm, setSheetOpen]);

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon-lg"
          variant="secondary"
          className="fixed right-4 bottom-4 z-50 size-12 cursor-pointer border border-white/10 bg-zinc-900/90 text-zinc-100 shadow-lg backdrop-blur-sm hover:bg-zinc-800 [&_svg]:size-6"
          aria-label="Configurações"
          title="Configurações"
        >
          <SettingsIcon />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-white/10 bg-zinc-950 text-zinc-100 sm:max-w-lg"
        onPointerDownOutside={handleDismissOutside}
        onInteractOutside={handleDismissOutside}
      >
        <SheetHeader className="shrink-0 border-b border-white/10">
          <SheetTitle>Configurações</SheetTitle>
          <SheetDescription className="text-zinc-400">
            Adicione streams, edite URLs, remova transmissões e organize o layout
            aqui. O grid principal é só para assistir ({streams.length}/
            {MAX_STREAMS}).
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-200">
              Nova transmissão
            </h3>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="stream-url" className="text-zinc-300">
                  URL da transmissão
                </Label>
                <Input
                  id="stream-url"
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="https://twitch.tv/canal ou https://youtube.com/watch?v=..."
                  className="h-11 border-white/15 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus:border-white/50 focus:ring-0 focus-visible:border-white/50 focus-visible:ring-0"
                  autoComplete="off"
                />
                {error ? (
                  <p className="text-sm text-red-400" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
              <Button
                type="submit"
                className="h-11 w-full cursor-pointer"
                disabled={atStreamLimit}
              >
                {atStreamLimit ? "Limite de 4 streams" : "Adicionar"}
              </Button>
            </form>
            <p className="text-xs leading-relaxed text-zinc-500">
              Alguns canais do YouTube bloqueiam embed em sites externos. Nesses
              casos, use o link &quot;Assistir no YouTube&quot; no player.
            </p>
          </section>

          {streams.length > 0 ? (
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-200">
                Link compartilhável
              </h3>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl ?? ""}
                  className="h-11 min-w-0 border-white/15 bg-zinc-900 text-zinc-300 focus:ring-0 focus-visible:ring-0"
                  aria-label="Link compartilhável"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 border-white/15 bg-transparent px-3 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
                  onClick={() => void handleCopyShareUrl()}
                  aria-label="Copiar link"
                  title="Copiar link"
                >
                  <CopyIcon className="size-4" />
                </Button>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500">
                Cada stream vira um segmento na URL. Twitch usa o nome do canal;
                YouTube usa yt-VIDEO_ID.
              </p>
            </section>
          ) : null}

          {streams.length > 0 ? (
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-200">
                Transmissões ativas
              </h3>
              <div className="space-y-2">
                {streams.map((stream) => (
                  <StreamUrlRow key={stream.id} stream={stream} />
                ))}
              </div>
            </section>
          ) : null}

          {streams.length > 0 ? (
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-200">
                Mapa do layout
              </h3>
              <LayoutMap
                active={sheetOpen}
                onInteractionChange={handleLayoutInteractionChange}
              />
            </section>
          ) : null}
        </div>

        <SheetFooter
          className={cn(
            "shrink-0 border-t border-white/10 px-4 py-4",
            streams.length === 0 && "hidden",
          )}
        >
          <Button
            type="button"
            variant="outline"
            className="w-full border-white/15 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
            onClick={handleClearAll}
          >
            Limpar todas
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
