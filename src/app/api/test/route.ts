import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("Test endpoint hit!");
  return NextResponse.json({ message: "Test endpoint working" });
}

export async function POST(request: NextRequest) {
  console.log("Test POST endpoint hit!");
  return NextResponse.json({ message: "Test POST endpoint working" });
}
