import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/server/auth";
import { validCollection } from "@/lib/server/store";
import { AdminShell } from "@/features/admin/Shell";
import { Workspace } from "@/features/admin/Workspace";
export default async function Page({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  const { collection } = await params;
  if (!validCollection(collection)) notFound();
  return (
    <AdminShell username={user.username}>
      <Workspace userId={user.id} collection={collection} editing="new" />
    </AdminShell>
  );
}
