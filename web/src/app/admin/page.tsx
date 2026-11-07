import { redirect } from "next/navigation";
import { currentUser } from "@/lib/server/auth";
import { validCollection } from "@/lib/server/store";
import { AdminShell } from "@/features/admin/Shell";
import { Workspace } from "@/features/admin/Workspace";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  const { collection } = await searchParams;
  return (
    <AdminShell username={user.username}>
      <Workspace
        key={collection || "all"}
        collection={
          collection && validCollection(collection) ? collection : undefined
        }
      />
    </AdminShell>
  );
}
