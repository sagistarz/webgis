// // // export const interpolateColor = (value: number): string => {
// // //   value = Math.max(0, Math.min(1, value));
// // //   const colors = [
// // //     { r: 0, g: 255, b: 0 }, // Hijau
// // //     { r: 0, g: 0, b: 255 }, // Biru
// // //     { r: 255, g: 255, b: 0 }, // Kuning
// // //     { r: 255, g: 0, b: 0 }, // Merah
// // //   ];
// // //   const stops = [0, 0.333, 0.667, 1.0];
// // //   let i = 0;
// // //   while (i < stops.length - 1 && value > stops[i + 1]) i++;
// // //   const t = (value - stops[i]) / (stops[i + 1] - stops[i]);
// // //   const r = Math.round(colors[i].r + t * (colors[i + 1].r - colors[i].r));
// // //   const g = Math.round(colors[i].g + t * (colors[i + 1].g - colors[i].g));
// // //   const b = Math.round(colors[i].b + t * (colors[i + 1].b - colors[i].b));
// // //   return `rgba(${r}, ${g}, ${b}, 0.85)`;
// // // };

// // export const interpolateColor = (value: number): string => {
// //   // Jika nilai > 1.0, kembalikan warna tertinggi (merah) langsung
// //   if (value > 1.0) {
// //     return "rgba(255, 0, 0, 0.85)";
// //   }
// //   // Batasi nilai antara 0 dan 1 untuk interpolasi
// //   value = Math.max(0, Math.min(1, value));
// //   const colors = [
// //     { r: 0, g: 255, b: 0 }, // Hijau
// //     { r: 0, g: 0, b: 255 }, // Biru
// //     { r: 255, g: 255, b: 0 }, // Kuning
// //     { r: 255, g: 0, b: 0 }, // Merah
// //   ];
// //   const stops = [0, 0.333, 0.667, 1.0];
// //   let i = 0;
// //   while (i < stops.length - 1 && value > stops[i + 1]) i++;
// //   const t = (value - stops[i]) / (stops[i + 1] - stops[i]);
// //   const r = Math.round(colors[i].r + t * (colors[i + 1].r - colors[i].r));
// //   const g = Math.round(colors[i].g + t * (colors[i + 1].g - colors[i].g));
// //   const b = Math.round(colors[i].b + t * (colors[i + 1].b - colors[i].b));
// //   return `rgba(${r}, ${g}, ${b}, 0.85)`;
// // };

// export const interpolateColor = (value: number): string => {
//   // Normalisasi nilai untuk AOD (0–1)
//   const normalized = Math.min(Math.max(value, 0), 1); // Normalisasi ke 0–1
//   if (normalized <= 0.25) {
//     return `rgba(0, 255, 0, 0.85)`; // Hijau untuk nilai rendah
//   } else if (normalized <= 0.5) {
//     return `rgba(0, 0, 255, 0.85)`; // Biru untuk nilai sedang
//   } else if (normalized <= 0.75) {
//     return `rgba(255, 255, 0, 0.85)`; // Kuning untuk nilai tinggi
//   } else {
//     return `rgba(255, 0, 0, 0.85)`; // Merah untuk nilai sangat tinggi
//   }
// };

// // utils/color.ts
// export const interpolatePM25Color = (value: number): string => {
//   if (value <= 50) return "rgba(0, 204, 0, 0.7)"; // Baik
//   if (value <= 100) return "rgba(1, 51, 255, 0.7)"; // Sedang
//   if (value <= 199) return "rgba(255, 201, 0, 0.7)"; // Tidak Sehat
//   if (value <= 299) return "rgba(255, 0, 0, 0.7)"; // Sangat Tidak Sehat
//   return "rgba(34, 34, 34, 1)"; // Berbahaya
// };

export const interpolateColor = (value: number): string => {
  const opacity = 0.85;
  if (value <= 0.1) {
    return `rgba(0, 255, 0, ${opacity})`;
  } else if (value <= 0.2) {
    const ratio = (value - 0.1) / 0.1;
    const r = Math.round(255 * ratio);
    const g = 255;
    return `rgba(${r}, ${g}, 0, ${opacity})`;
  } else if (value <= 0.3) {
    const ratio = (value - 0.2) / 0.1;
    const r = 255;
    const g = Math.round(255 - 165 * ratio);
    return `rgba(${r}, ${g}, 0, ${opacity})`;
  } else {
    return `rgba(255, 0, 0, ${opacity})`;
  }
};

export const interpolatePM25Color = (value: number | null): string => {
  const opacity = 0.85;
  if (value === null || isNaN(value)) {
    return `rgba(160, 174, 192, ${opacity})`; // Warna abu-abu untuk data tidak tersedia
  }
  if (value <= 50) {
    return `rgba(0, 204, 0, ${opacity})`; // Baik
  } else if (value <= 100) {
    return `rgba(1, 51, 255, ${opacity})`; // Sedang
  } else if (value <= 199) {
    return `rgba(255, 201, 0, ${opacity})`; // Tidak Sehat
  } else if (value <= 299) {
    return `rgba(255, 0, 0, ${opacity})`; // Sangat Tidak Sehat
  } else {
    return `rgba(34, 34, 34, ${opacity})`; // Berbahaya
  }
};
