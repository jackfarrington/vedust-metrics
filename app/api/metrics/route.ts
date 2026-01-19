import { NextRequest, NextResponse } from "next/server";

import { getMetrics } from "@/lib/metrics";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (authHeader !== `Bearer ${process.env.PROMETHEUS_SECRET}`) {
    console.log('Unauthorized request.');
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const METRIC_PREFIX = 'dust_';

  try {
    const metrics = await getMetrics();

    let lines: string[] = [];

    const addGauge = (name: string, help: string, value: number | bigint | string | undefined) => {
      if (value == null) return;
      const numValue = Number(value);
      if (isNaN(numValue)) return;

      const metric_name = `${METRIC_PREFIX}${name}`;

      lines.push(`# HELP ${metric_name} ${help}`);
      lines.push(`# TYPE ${metric_name} gauge`);
      lines.push(`${metric_name} ${numValue}`);
    };

    addGauge('remaining_supply', 'Remaining supply of DUST', metrics.remainingSupply);
    addGauge('pending_burn', 'Pending DUST to be burned', metrics.pendingBurn);
    addGauge('circulation', 'Circulating supply of DUST', metrics.circulation);
    addGauge('locked', 'DUST locked as veDUST', metrics.locked);
    addGauge('infinite_locked', 'Permanently locked DUST', metrics.infiniteLocked);
    addGauge('power', 'veDUST power', metrics.power);
    addGauge('emitted_supply', 'DUST emitted so far', metrics.emittedSupply);

    lines.push('# EOF');

    const metricsText = lines.join('\n') + '\n';

    return new NextResponse(metricsText, {
      status: 200,
      headers: {
        'Content-Type': 'application/openmetrics-text; version=1.0.0; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
