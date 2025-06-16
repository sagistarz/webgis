import { NextResponse } from "next/server";

export async function GET() {
  try {
    // const response = await fetch("https://f415-180-254-75-101.ngrok-free.app/api2/weather/weatherdata-now/", {
    //   headers: {
    //     Accept: "application/json",
    //     "ngrok-skip-browser-warning": "true",
    //   },
    //   cache: "no-store",
    // });
    const response = await fetch("http://127.0.0.1:8000/api2/weather/weatherdata-now/", {
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data); // Kembalikan semua data stasiun
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch weather data",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
