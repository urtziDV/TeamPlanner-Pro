import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET() {
  const logoPath = path.join(process.cwd(), 'prisma', 'company_logo.png');
  
  if (fs.existsSync(logoPath)) {
    const file = fs.readFileSync(logoPath);
    return new NextResponse(file, { 
      headers: { 
        'Content-Type': 'image/png', 
        'Cache-Control': 'no-store, max-age=0' 
      } 
    });
  }
  
  return new NextResponse(null, { status: 404 });
}
