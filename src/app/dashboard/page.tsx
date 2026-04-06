import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  // Ensure dev user exists in DB
  await db.user.upsert({
    where: { id: user.userId },
    update: {},
    create: {
      id: user.userId,
      email: "dev@adventurebuildr.com",
    },
  });

  const stories = await db.story.findMany({
    where: { authorId: user.userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          episodes: true,
          events: true,
        },
      },
    },
  });

  return <DashboardClient stories={JSON.parse(JSON.stringify(stories))} />;
}
