// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     const response = await fetch("http://127.0.0.1:8000/api2/weather/weatherdata-now/", {
//       headers: {
//         Accept: "application/json",
//         "ngrok-skip-browser-warning": "true",
//       },
//       cache: "no-store",
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return NextResponse.json(data); // Kembalikan semua data stasiun
//   } catch (error) {
//     console.error("Error fetching weather data:", error);
//     return NextResponse.json(
//       {
//         error: error instanceof Error ? error.message : "Failed to fetch weather data",
//       },
//       { status: 500 }
//     );
//   }
// }

// export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiUrl = process.env.API_BASE_URL
      ? `${process.env.API_BASE_URL}/api2/weather/weatherdata-now/`
      : "http://127.0.0.1:8000/api2/weather/weatherdata-now/";

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
    console.log("API Proxy Weather data sample:", JSON.stringify(data).slice(0, 300));

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Weather Proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch weather data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";