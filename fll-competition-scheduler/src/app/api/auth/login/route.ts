import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Read the users database
    const dbPath = path.join(process.cwd(), "src", "data", "users.json");
    const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    // Find the user
    const user = data.users.find(
      (u: { username: string; password: string }) =>
        u.username === username && u.password === password
    );

    if (user) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (_error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
