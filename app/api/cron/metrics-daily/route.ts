import { NextResponse } from "next/server";

export async function GET() {
  // Your code to run periodically goes here
  console.log('Running daily metrics task.');

  // Example: update a database, fetch data from a third-party API, etc.

  return NextResponse.json({
    success: true,
    message: 'Metrics updated successfully',
    time: new Date().toISOString(),
  });
}
