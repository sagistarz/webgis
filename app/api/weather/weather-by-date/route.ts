import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { date } = await request.json();

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const weatherUrl = "http://127.0.0.1:8000/api2/weather/weatherdatabydate/";
    // const weatherUrl = "https://f415-180-254-75-101.ngrok-free.app/api2/weather/weatherdatabydate/";

    const response = await fetch(weatherUrl, {
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
    console.error("Weather History Proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to fetch weather history data",
        message,
      },
      { status: 500 }
    );
  }
}
