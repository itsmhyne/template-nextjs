// app/dashboard/users/edit/[id]/page.tsx

import { EditUserForm } from "../edituser.form";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export const metadata = {
  title: "NextJs Template - Users Edit",
};

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  return <EditUserForm userId={id} />;
}
