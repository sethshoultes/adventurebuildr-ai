import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const stories = await db.story.findMany({
    where: { authorId: userId },
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
