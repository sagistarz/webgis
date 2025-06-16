// utils/geocoding.ts
let lastRequestTime = 0;

export async function getLocationName(lat: number, lng: number): Promise<string> {
  // Rate limiting (1 detik antara request)
  const now = Date.now();
  if (now - lastRequestTime < 1000) {
    return "Sedang memuat...";
  }
  lastRequestTime = now;

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: {
        "User-Agent": "AirQualityApp/1.0 (novialestarin@gmail.com)", // Ganti dengan info aplikasi Anda
      },
    });

    const data = await response.json();

    if (data.error) {
      return "Lokasi tidak dikenali";
    }

    const address = data.address;
    return [address.road, address.village, address.suburb, address.city_district, address.city, address.state, address.country].filter(Boolean).join(", ");
  } catch (error) {
    console.error("Gagal mendapatkan nama lokasi:", error);
    return "Lokasi tidak dikenali";
  }
}

// utils/geocoding.ts
// export async function getLocationDetails(lat: number, lng: number) {
//   try {
//     const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
//       headers: {
//         "User-Agent": "AirQualityApp/1.0 (novialestarin@gmail.com)",
//       },
//     });

//     const data = await response.json();

//     if (data.error) {
//       return {
//         name: "Lokasi tidak dikenali",
//         address: "",
//         type: "unknown",
//         fullData: {},
//       };
//     }

//     const { address } = data;

//     // Format nama lokasi
//     const name = address.road || address.quarter || address.neighbourhood || address.suburb || address.city_district || address.city || "Lokasi";

//     // Format alamat lengkap
//     const addressParts = [
//       address.road && `Jalan ${address.road}`,
//       address.village && `Kelurahan ${address.village}`,
//       address.suburb && `Kecamatan ${address.suburb}`,
//       address.city_district && `Kota ${address.city_district}`,
//       address.city && `Kota ${address.city}`,
//       address.state && `Provinsi ${address.state}`,
//       address.postcode && `Kode Pos ${address.postcode}`,
//     ].filter(Boolean);

//     return {
//       name,
//       address: addressParts.join(", "),
//       type: address.road ? "street" : "area",
//       fullData: address,
//     };
//   } catch (error) {
//     console.error("Gagal mendapatkan detail lokasi:", error);
//     return {
//       name: "Lokasi tidak dikenali",
//       address: "",
//       type: "unknown",
//       fullData: {},
//     };
//   }
// }
