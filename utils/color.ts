// // export const interpolateColor = (value: number): string => {
// //   // Rentang untuk AOD: 0 hingga 4
// //   const normalized = Math.min(Math.max(value, 0), 4) / 4; // Normalisasi ke 0-1

// //   // Definisi warna mejikuhibiniu (terbalik: ungu untuk 0, merah untuk 4)
// //   const colors = [
// //     { r: 128, g: 0, b: 128, a: 0.85 }, // Ungu (#800080)
// //     { r: 75, g: 0, b: 130, a: 0.85 },  // Nila (#4B0082)
// //     { r: 0, g: 0, b: 255, a: 0.85 },   // Biru (#0000FF)
// //     { r: 0, g: 128, b: 0, a: 0.85 },   // Hijau (#008000)
// //     { r: 255, g: 255, b: 0, a: 0.85 }, // Kuning (#FFFF00)
// //     { r: 255, g: 165, b: 0, a: 0.85 }, // Jingga (#FFA500)
// //     { r: 255, g: 0, b: 0, a: 0.85 },   // Merah (#FF0000)
// //   ];

// //   const steps = colors.length - 1;
// //   const step = 1 / steps;
// //   const index = Math.floor(normalized * steps);
// //   const fraction = (normalized - index * step) / step;

// //   if (index >= steps) {
// //     const c = colors[steps];
// //     return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
// //   }

// //   const c1 = colors[index];
// //   const c2 = colors[index + 1];

// //   const r = Math.round(c1.r + (c2.r - c1.r) * fraction);
// //   const g = Math.round(c1.g + (c2.g - c1.g) * fraction);
// //   const b = Math.round(c1.b + (c2.b - c1.b) * fraction);

// //   return `rgba(${r}, ${g}, ${b}, ${c1.a})`;
// // };

// export const interpolateColor = (value: number): string => {
//   const opacity = 0.85;

//   // Normalisasi nilai di atas 1.0 ke merah
//   if (value > 1.0) {
//     return `rgba(255, 0, 0, ${opacity})`; // Merah untuk >1.0
//   }

//   // Rentang dan warna
//   const ranges = [
//     { max: 0.3, r: 0, g: 255, b: 0 }, // Hijau
//     { max: 0.5, r: 255, g: 255, b: 0 }, // Kuning
//     { max: 0.7, r: 255, g: 165, b: 0 }, // Orange
//     { max: 1.0, r: 255, g: 0, b: 0 }, // Merah
//   ];

//   // Cari rentang yang sesuai
//   for (let i = 0; i < ranges.length - 1; i++) {
//     const current = ranges[i];
//     const next = ranges[i + 1];
//     if (value <= next.max) {
//       const ratio = (value - current.max) / (next.max - current.max);
//       const r = Math.round(current.r + ratio * (next.r - current.r));
//       const g = Math.round(current.g + ratio * (next.g - current.g));
//       const b = Math.round(current.b + ratio * (next.b - current.b));
//       return `rgba(${r}, ${g}, ${b}, ${opacity})`;
//     }
//   }

//   // Default untuk nilai <= 0.3
//   return `rgba(0, 255, 0, ${opacity})`;
// };

// export const interpolatePM25Color = (value: number | null): string => {
//   const opacity = 0.85;
//   if (value === null || isNaN(value)) {
//     return `rgba(160, 174, 192, ${opacity})`; // Abu-abu untuk data tidak tersedia
//   }

//   // Rentang dan warna
//   const ranges = [
//     { max: 0, r: 0, g: 204, b: 0 }, // Hijau
//     { max: 51, r: 1, g: 51, b: 255 }, // Biru
//     { max: 101, r: 255, g: 201, b: 0 }, // Kuning
//     { max: 200, r: 255, g: 0, b: 0 }, // Merah
//     { max: 300, r: 34, g: 34, b: 34 }, // Hitam
//   ];

//   // Cari rentang yang sesuai
//   for (let i = 0; i < ranges.length - 1; i++) {
//     const current = ranges[i];
//     const next = ranges[i + 1];
//     if (value <= next.max) {
//       const ratio = (value - current.max) / (next.max - current.max);
//       const r = Math.round(current.r + ratio * (next.r - current.r));
//       const g = Math.round(current.g + ratio * (next.g - current.g));
//       const b = Math.round(current.b + ratio * (next.b - current.b));
//       return `rgba(${r}, ${g}, ${b}, ${opacity})`;
//     }
//   }

//   // Default untuk nilai <= 50
//   return `rgba(0, 204, 0, ${opacity})`;
// };

// export const getStaticPM25Color = (value: number | null): string => {
//   const opacity = 0.7;
//   if (value === null || isNaN(value)) {
//     return `rgba(160, 174, 192, ${opacity})`; // Abu-abu untuk data tidak tersedia
//   }
//   if (value <= 50) return `rgba(0, 204, 0, ${opacity})`; // Baik: #00CC00
//   if (value <= 100) return `rgba(1, 51, 255, ${opacity})`; // Sedang: #0133FF
//   if (value <= 199) return `rgba(255, 201, 0, ${opacity})`; // Tidak Sehat: #FFC900
//   if (value <= 299) return `rgba(255, 0, 0, ${opacity})`; // Sangat Tidak Sehat: #FF0000
//   return `rgba(34, 34, 34, ${opacity})`; // Berbahaya: #222222
// };

export const interpolateColor = (value: number): string => {
  const opacity = 0.85;

  // Normalisasi nilai di atas 4.0 ke merah
  if (value >= 4.0) {
    return `rgba(255, 0, 0, ${opacity})`; // Merah untuk >=4.0
  }

  // Rentang dan warna (mejikuhibiniu: ungu, nila, biru, hijau, kuning, jingga, merah)
  const ranges = [
    { max: 0.0, r: 128, g: 0, b: 128 }, // Ungu
    { max: 0.8, r: 75, g: 0, b: 130 },  // Nila
    { max: 1.6, r: 0, g: 0, b: 255 },   // Biru
    { max: 2.4, r: 0, g: 128, b: 0 },   // Hijau
    { max: 3.2, r: 255, g: 255, b: 0 }, // Kuning
    { max: 4.0, r: 255, g: 165, b: 0 }, // Jingga
  ];

  // Cari rentang yang sesuai
  for (let i = 0; i < ranges.length - 1; i++) {
    const current = ranges[i];
    const next = ranges[i + 1];
    if (value <= next.max) {
      const ratio = (value - current.max) / (next.max - current.max);
      const r = Math.round(current.r + ratio * (next.r - current.r));
      const g = Math.round(current.g + ratio * (next.g - current.g));
      const b = Math.round(current.b + ratio * (next.b - current.b));
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  // Default untuk nilai <= 0.0
  return `rgba(128, 0, 128, ${opacity})`; // Ungu
};

export const interpolatePM25Color = (value: number | null): string => {
  const opacity = 0.85;
  if (value === null || isNaN(value)) {
    return `rgba(160, 174, 192, ${opacity})`; // Abu-abu untuk data tidak tersedia
  }

  // Rentang dan warna
  const ranges = [
    { max: 0, r: 0, g: 204, b: 0 },     // Hijau
    { max: 51, r: 1, g: 51, b: 255 },   // Biru
    { max: 101, r: 255, g: 201, b: 0 }, // Kuning
    { max: 200, r: 255, g: 0, b: 0 },   // Merah
    { max: 300, r: 34, g: 34, b: 34 },  // Hitam
  ];

  // Cari rentang yang sesuai
  for (let i = 0; i < ranges.length - 1; i++) {
    const current = ranges[i];
    const next = ranges[i + 1];
    if (value <= next.max) {
      const ratio = (value - current.max) / (next.max - current.max);
      const r = Math.round(current.r + ratio * (next.r - current.r));
      const g = Math.round(current.g + ratio * (next.g - current.g));
      const b = Math.round(current.b + ratio * (next.b - current.b));
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  // Default untuk nilai <= 50
  return `rgba(0, 204, 0, ${opacity})`;
};

export const getStaticPM25Color = (value: number | null): string => {
  const opacity = 0.7;
  if (value === null || isNaN(value)) {
    return `rgba(160, 174, 192, ${opacity})`; // Abu-abu untuk data tidak tersedia
  }
  if (value <= 50) return `rgba(0, 204, 0, ${opacity})`; // Baik: #00CC00
  if (value <= 100) return `rgba(1, 51, 255, ${opacity})`; // Sedang: #0133FF
  if (value <= 199) return `rgba(255, 201, 0, ${opacity})`; // Tidak Sehat: #FFC900
  if (value <= 299) return `rgba(255, 0, 0, ${opacity})`; // Sangat Tidak Sehat: #FF0000
  return `rgba(34, 34, 34, ${opacity})`; // Berbahaya: #222222
};