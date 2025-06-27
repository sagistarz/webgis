// export const interpolateColor = (value: number): string => {
//   value = Math.max(0, Math.min(1, value));
//   const colors = [
//     { r: 0, g: 255, b: 0 }, // Hijau
//     { r: 0, g: 0, b: 255 }, // Biru
//     { r: 255, g: 255, b: 0 }, // Kuning
//     { r: 255, g: 0, b: 0 }, // Merah
//   ];
//   const stops = [0, 0.333, 0.667, 1.0];
//   let i = 0;
//   while (i < stops.length - 1 && value > stops[i + 1]) i++;
//   const t = (value - stops[i]) / (stops[i + 1] - stops[i]);
//   const r = Math.round(colors[i].r + t * (colors[i + 1].r - colors[i].r));
//   const g = Math.round(colors[i].g + t * (colors[i + 1].g - colors[i].g));
//   const b = Math.round(colors[i].b + t * (colors[i + 1].b - colors[i].b));
//   return `rgba(${r}, ${g}, ${b}, 0.85)`;
// };

export const interpolateColor = (value: number): string => {
  // Jika nilai > 1.0, kembalikan warna tertinggi (merah) langsung
  if (value > 1.0) {
    return "rgba(255, 0, 0, 0.85)";
  }
  // Batasi nilai antara 0 dan 1 untuk interpolasi
  value = Math.max(0, Math.min(1, value));
  const colors = [
    { r: 0, g: 255, b: 0 }, // Hijau
    { r: 0, g: 0, b: 255 }, // Biru
    { r: 255, g: 255, b: 0 }, // Kuning
    { r: 255, g: 0, b: 0 }, // Merah
  ];
  const stops = [0, 0.333, 0.667, 1.0];
  let i = 0;
  while (i < stops.length - 1 && value > stops[i + 1]) i++;
  const t = (value - stops[i]) / (stops[i + 1] - stops[i]);
  const r = Math.round(colors[i].r + t * (colors[i + 1].r - colors[i].r));
  const g = Math.round(colors[i].g + t * (colors[i + 1].g - colors[i].g));
  const b = Math.round(colors[i].b + t * (colors[i + 1].b - colors[i].b));
  return `rgba(${r}, ${g}, ${b}, 0.85)`;
};
