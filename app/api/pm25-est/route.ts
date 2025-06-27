import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pm25Url = "http://127.0.0.1:8000/api1/get-data-pm25/";

    const response = await fetch(pm25Url, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Proxy PM25 data sample:", JSON.stringify(data).slice(0, 300));

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Proxy error PM25:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch PM25 data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
