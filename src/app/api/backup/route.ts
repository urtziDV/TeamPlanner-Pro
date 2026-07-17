import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'prisma', 'inventory.db');
    
    if (!fs.existsSync(dbPath)) {
      return new NextResponse("Database file not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `ToolTracker_Backup_${dateStr}_${timeStr}.db`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Backup error:', error);
    return new NextResponse("Error generating backup", { status: 500 });
  }
}
