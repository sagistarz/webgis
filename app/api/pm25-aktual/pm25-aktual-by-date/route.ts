import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { date } = await request.json();

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const pm25Url = "http://127.0.0.1:8000/api2/weather/datapm25bydate/";
    // const pm25Url = "https://f415-180-254-75-101.ngrok-free.app/api2/weather/datapm25bydate/";

    const response = await fetch(pm25Url, {
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
