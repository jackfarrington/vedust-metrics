import { NextRequest, NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';

import { getMetrics } from "@/lib/metrics";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  console.log('Running daily metrics task.');

  const metrics = await getMetrics();

  console.log('Metrics:', metrics);

  try {
    console.log('Saving to database...');

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO vedust_metrics (symbol, dust_supply, burn_pending, in_circulation, vedust_locked, vedust_power, dust_emitted, timestamp)
      VALUES (${metrics.symbol}, ${metrics.remainingSupply}, ${metrics.pendingBurn}, ${metrics.circulation}, ${metrics.locked}, ${metrics.power}, ${metrics.emittedSupply}, NOW())
    `;

    console.log('Metrics saved to database.');

    return NextResponse.json({
      success: true,
      message: 'Metrics updated successfully',
      time: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
