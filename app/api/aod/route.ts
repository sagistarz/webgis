//data AOD
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const aodUrl = "http://127.0.0.1:8000/api1/get-data-aod/";
    // const aodUrl = "https://f415-180-254-75-101.ngrok-free.app/api1/get-data-aod/";

    const response = await fetch(aodUrl, {
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
    console.log("API Proxy data sample:", JSON.stringify(data).slice(0, 300));

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch AOD data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
