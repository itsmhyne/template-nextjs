// app/dashboard/users/page.tsx

import { UsersTable } from "./users.table";

export const metadata = {
  title: "NextJs Template -User Management",
};

export default function UsersPage() {
  return (
    <div className="container mx-auto py-6">
      <UsersTable />
    </div>
  );
}
