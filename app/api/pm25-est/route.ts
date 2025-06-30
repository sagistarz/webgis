import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiUrl = process.env.API_BASE_URL
      ? `${process.env.API_BASE_URL}/api1/get-data-pm25/`
      : "http://127.0.0.1:8000/api1/get-data-pm25/";

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const rawText = await response.text();
    const cleanText = rawText.replace(/NaN/g, "null");
    const data = JSON.parse(cleanText);
    console.log("API Proxy PM25 data sample:", JSON.stringify(data).slice(0, 300));

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("PM25 Proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch PM25 data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}