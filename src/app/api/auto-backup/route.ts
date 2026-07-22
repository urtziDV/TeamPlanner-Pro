import { NextResponse } from "next/server";
import { exportBackupAction } from "@/app/actions";

export async function GET() {
  try {
    const result = await exportBackupAction();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
