import { NextRequest, NextResponse } from "next/server";

import { getMetrics } from "@/lib/metrics";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  
  console.log('Running daily metrics task.');

  const metrics = await getMetrics();
  // Example: update a database, fetch data from a third-party API, etc.

  return NextResponse.json({
    success: true,
    message: 'Metrics updated successfully',
    time: new Date().toISOString(),
  });
}
