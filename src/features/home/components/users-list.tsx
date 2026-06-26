import type { User } from "../schemas/user.schema";

import { UserCard } from "./user-card";

interface UsersListProps {
  users: User;
  onUserAction?: (userId: number) => void;
}

export function UsersList({ users, onUserAction }: UsersListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onOpenDetails={onUserAction} />
      ))}
    </div>
  );
}
