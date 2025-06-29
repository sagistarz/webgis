// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   try {
//     const { date } = await request.json();

//     if (!date) {
//       return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
//     }

//     const weatherUrl = "http://127.0.0.1:8000/api2/weather/weatherdatabydate/";
//     // const weatherUrl = "https://f415-180-254-75-101.ngrok-free.app/api2/weather/weatherdatabydate/";

//     const response = await fetch(weatherUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "ngrok-skip-browser-warning": "true",
//       },
//       body: JSON.stringify({ date }),
//       cache: "no-store",
//     });

//     const rawText = await response.text();
//     const cleanText = rawText.replace(/NaN/g, "null");
//     const data = JSON.parse(cleanText);

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("Weather History Proxy error:", error);
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json(
//       {
//         error: "Failed to fetch weather history data",
//         message,
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { date } = await request.json();
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const apiUrl = process.env.API_BASE_URL
      ? `${process.env.API_BASE_URL}/api2/weather/weatherdatabydate/`
      : "http://127.0.0.1:8000/api2/weather/weatherdatabydate/";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ date }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const rawText = await response.text();
    const cleanText = rawText.replace(/NaN/g, "null");
    const data = JSON.parse(cleanText);
    console.log("API Proxy Weather by date data sample:", JSON.stringify(data).slice(0, 300));

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Weather History Proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch weather history data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}