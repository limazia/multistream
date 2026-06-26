import { Badge } from "@components/ui/badge";

interface UsersQueryStatusProps {
  isLoadingUsers: boolean;
  isFetchingUsers: boolean;
  isErrorUsers: boolean;
  userCount: number;
}

export function UsersQueryStatus({
  isLoadingUsers,
  isFetchingUsers,
  isErrorUsers,
  userCount,
}: UsersQueryStatusProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={isLoadingUsers ? "default" : "outline"}>
        isLoadingUsers: {String(isLoadingUsers)}
      </Badge>
      <Badge variant={isFetchingUsers ? "default" : "outline"}>
        isFetchingUsers: {String(isFetchingUsers)}
      </Badge>
      <Badge variant={isErrorUsers ? "destructive" : "outline"}>
        isErrorUsers: {String(isErrorUsers)}
      </Badge>
      <Badge variant="secondary">users.length: {userCount}</Badge>
    </div>
  );
}
