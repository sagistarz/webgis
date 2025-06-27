import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { tanggal } = await request.json();

    if (!tanggal) {
      return NextResponse.json({ error: "Tanggal parameter is required" }, { status: 400 });
    }

    const pm25Url = "http://127.0.0.1:8000/api1/get-data-pm25bydate/";
    // const pm25Url = "https://f415-180-254-75-101.ngrok-free.app/api1/get-data-pm25bydate/";

    const response = await fetch(pm25Url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ tanggal }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const rawText = await response.text();
    const cleanText = rawText.replace(/NaN/g, "null"); // Handle NaN values
    const data = JSON.parse(cleanText);

    console.log("Historical PM25 data sample:", JSON.stringify(data).slice(0, 300));

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    });
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
