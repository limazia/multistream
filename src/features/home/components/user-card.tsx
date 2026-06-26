import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";

import type { UserRecord } from "../schemas/user.schema";

interface UserCardProps {
  user: UserRecord;
  onOpenDetails?: (userId: number) => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5 text-sm sm:grid-cols-[minmax(0,7rem)_1fr] sm:gap-2">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 wrap-break-word text-foreground">{value}</dd>
    </div>
  );
}

export function UserCard({ user, onOpenDetails }: UserCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleOpenDetails = () => {
    setDetailsOpen(true);
    onOpenDetails?.(user.id);
  };

  return (
    <>
      <Card size="sm" className="transition-shadow hover:shadow-md">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-base">{user.name}</CardTitle>
          <CardDescription>@{user.username}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground text-xs">
          <p>
            <span className="font-medium text-foreground">Email:</span>{" "}
            {user.email}
          </p>
          <p>
            <span className="font-medium text-foreground">Cidade:</span>{" "}
            {user.address.city}
          </p>
          <p>
            <span className="font-medium text-foreground">Empresa:</span>{" "}
            {user.company.name}
          </p>
          <button
            type="button"
            className="mt-2 text-left text-primary text-xs font-medium underline-offset-2 hover:underline"
            onClick={handleOpenDetails}
          >
            Ver detalhes
          </button>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent
          className="max-h-[min(90vh,36rem)] overflow-y-auto sm:max-w-lg"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>{user.name}</DialogTitle>
            <DialogDescription>
              @{user.username} · ID {user.id}
            </DialogDescription>
          </DialogHeader>

          <dl className="grid gap-3 pt-2">
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Telefone" value={user.phone} />
            <DetailRow label="Site" value={user.website} />
            <DetailRow
              label="Endereço"
              value={`${user.address.street}, ${user.address.suite} — ${user.address.city} (${user.address.zipcode})`}
            />
            <DetailRow
              label="Geo"
              value={`lat ${user.address.geo.lat}, lng ${user.address.geo.lng}`}
            />
            <DetailRow label="Empresa" value={user.company.name} />
            <DetailRow label="Slogan" value={user.company.catchPhrase} />
            <DetailRow label="BS" value={user.company.bs} />
          </dl>
        </DialogContent>
      </Dialog>
    </>
  );
}
