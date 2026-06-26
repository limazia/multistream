import { useCallback, useEffect, useState } from "react";
import { Trash2Icon } from "lucide-react";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { cn } from "@utils/cn";

import { useStreamStore } from "../hooks/use-stream-store";
import type { Stream } from "../schemas/stream.schema";

interface StreamUrlRowProps {
  stream: Stream;
}

export function StreamUrlRow({ stream }: StreamUrlRowProps) {
  const [url, setUrl] = useState(stream.originalUrl);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const updateStreamUrl = useStreamStore((state) => state.updateStreamUrl);
  const removeStream = useStreamStore((state) => state.removeStream);

  useEffect(() => {
    setUrl(stream.originalUrl);
    setError(null);
    setIsDirty(false);
  }, [stream.originalUrl, stream.id]);

  const handleSave = useCallback(() => {
    if (url.trim() === stream.originalUrl) {
      setError(null);
      return;
    }

    const result = updateStreamUrl(stream.id, url);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setError(null);
    setIsDirty(false);
  }, [stream.id, stream.originalUrl, updateStreamUrl, url]);

  const handleRemove = useCallback(() => {
    removeStream(stream.id);
  }, [removeStream, stream.id]);

  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-zinc-900/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor={`stream-url-${stream.id}`}
          className="truncate text-xs font-medium text-zinc-300"
        >
          {stream.label}
          <span
            className={cn(
              "ml-2 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
              stream.provider === "twitch"
                ? "bg-purple-500/20 text-purple-300"
                : "bg-red-500/20 text-red-300",
            )}
          >
            {stream.provider}
          </span>
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="shrink-0 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
          onClick={handleRemove}
          aria-label={`Remover ${stream.label}`}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </div>

      <Input
        id={`stream-url-${stream.id}`}
        value={url}
        onChange={(event) => {
          setUrl(event.target.value);
          setIsDirty(event.target.value.trim() !== stream.originalUrl);
          if (error) setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSave();
          }
        }}
        className="border-white/15 bg-zinc-950 text-xs text-zinc-100 placeholder:text-zinc-500"
        autoComplete="off"
      />

      {isDirty ? (
        <Button type="button" size="xs" className="w-full" onClick={handleSave}>
          Salvar URL
        </Button>
      ) : null}

      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
