import { NextResponse } from "next/server";

export default async function GET(request: Request) {
  // Your code to run periodically goes here
  console.log('Running metrics task.');

  // Example: update a database, fetch data from a third-party API, etc.

  return NextResponse.json({
    success: true,
    message: 'Metrics updated successfully',
    time: new Date().toISOString(),
  });
}
