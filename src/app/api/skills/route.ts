import { NextResponse } from "next/server";
import { getAllSkills } from "@/lib/skills";

export async function GET() {
  const skills = getAllSkills();
  return NextResponse.json({ skills, count: skills.length });
}
