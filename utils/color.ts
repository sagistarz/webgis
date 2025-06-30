// export const interpolateColor = (value: number): string => {
//   const opacity = 0.85;
//   if (value <= 0.1) {
//     return `rgba(0, 255, 0, ${opacity})`;
//   } else if (value <= 0.2) {
//     const ratio = (value - 0.1) / 0.1;
//     const r = Math.round(255 * ratio);
//     const g = 255;
//     return `rgba(${r}, ${g}, 0, ${opacity})`;
//   } else if (value <= 0.3) {
//     const ratio = (value - 0.2) / 0.1;
//     const r = 255;
//     const g = Math.round(255 - 165 * ratio);
//     return `rgba(${r}, ${g}, 0, ${opacity})`;
//   } else {
//     return `rgba(255, 0, 0, ${opacity})`;
//   }
// };

// export const interpolatePM25Color = (value: number | null): string => {
//   const opacity = 0.85;
//   if (value === null || isNaN(value)) {
//     return `rgba(160, 174, 192, ${opacity})`; // Warna abu-abu untuk data tidak tersedia
//   }
//   if (value <= 50) {
//     return `rgba(0, 204, 0, ${opacity})`; // Baik
//   } else if (value <= 100) {
//     return `rgba(1, 51, 255, ${opacity})`; // Sedang
//   } else if (value <= 199) {
//     return `rgba(255, 201, 0, ${opacity})`; // Tidak Sehat
//   } else if (value <= 299) {
//     return `rgba(255, 0, 0, ${opacity})`; // Sangat Tidak Sehat
//   } else {
//     return `rgba(34, 34, 34, ${opacity})`; // Berbahaya
//   }
// };

export const interpolateColor = (value: number): string => {
  const opacity = 0.85;

  // Normalisasi nilai di atas 1.0 ke merah
  if (value > 1.0) {
    return `rgba(255, 0, 0, ${opacity})`; // Merah untuk >1.0
  }

  // Rentang dan warna
  const ranges = [
    { max: 0.3, r: 0, g: 255, b: 0 }, // Hijau
    { max: 0.5, r: 255, g: 255, b: 0 }, // Kuning
    { max: 0.7, r: 255, g: 165, b: 0 }, // Orange
    { max: 1.0, r: 255, g: 0, b: 0 }, // Merah
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

  // Default untuk nilai <= 0.3
  return `rgba(0, 255, 0, ${opacity})`;
};

export const interpolatePM25Color = (value: number | null): string => {
  const opacity = 0.85;
  if (value === null || isNaN(value)) {
    return `rgba(160, 174, 192, ${opacity})`; // Abu-abu untuk data tidak tersedia
  }

  // Rentang dan warna
  const ranges = [
    { max: 0, r: 0, g: 204, b: 0 }, // Hijau
    { max: 51, r: 1, g: 51, b: 255 }, // Biru
    { max: 101, r: 255, g: 201, b: 0 }, // Kuning
    { max: 200, r: 255, g: 0, b: 0 }, // Merah
    { max: 300, r: 34, g: 34, b: 34 }, // Hitam
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