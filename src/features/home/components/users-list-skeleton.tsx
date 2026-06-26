import { UserCardSkeleton } from "./user-card-skeleton";

interface UsersListSkeletonProps {
  count?: number;
}

export function UsersListSkeleton({ count = 6 }: UsersListSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}
