import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkTokenBudget } from "@/lib/metering";

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const budget = await checkTokenBudget(authUser.userId);
  return NextResponse.json(budget);
}
