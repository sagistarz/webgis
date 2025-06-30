import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { date } = await request.json();

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const apiUrl = process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/api2/weather/datapm25bydate/` : "http://127.0.0.1:8000/api2/weather/datapm25bydate/";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ date }),
      cache: "no-store",
    });

    const rawText = await response.text();
    const cleanText = rawText.replace(/NaN/g, "null");
    const data = JSON.parse(cleanText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("PM25 History Proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to fetch PM25 history data",
        message,
      },
      { status: 500 }
    );
  }
}