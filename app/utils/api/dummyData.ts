// // utils/mockApi.ts
// export const fetchCalendarData = async (month: number, year: number) => {
//   // Simulasikan delay jaringan
//   await new Promise((resolve) => setTimeout(resolve, 500));

//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const firstDayOfWeek = new Date(year, month, 1).getDay();
//   const daysInPrevMonth = new Date(year, month, 0).getDate();

//   // Data aktual (dummy) untuk bulan tersebut
//   const actualData = Array.from({ length: 10 }, (_, i) => ({
//     date: new Date(year, month, i + 1),
//     pmValue: Math.floor(50 + Math.random() * 300), // Nilai antara 50-350
//     isPrediction: false,
//   }));

//   // Data prediksi untuk sisa bulan
//   const predictedData = Array.from({ length: daysInMonth - 10 }, (_, i) => ({
//     date: new Date(year, month, i + 11),
//     pmValue: Math.floor(50 + Math.random() * 300),
//     isPrediction: true,
//   }));

//   return {
//     month,
//     year,
//     days: [
//       // Hari dari bulan sebelumnya
//       ...Array.from({ length: firstDayOfWeek }, (_, i) => ({
//         day: daysInPrevMonth - firstDayOfWeek + i + 1,
//         month: "prev" as const,
//         pmValue: null,
//         isPrediction: false,
//       })),

//       // Hari dari bulan ini
//       ...Array.from({ length: daysInMonth }, (_, i) => {
//         const day = i + 1;
//         const actual = actualData.find((d) => d.date.getDate() === day);
//         const predicted = predictedData.find((d) => d.date.getDate() === day);

//         return {
//           day,
//           month: "current" as const,
//           pmValue: actual?.pmValue || predicted?.pmValue || Math.floor(Math.random() * 350),
//           isPrediction: !actual,
//         };
//       }),

//       // Hari dari bulan berikutnya (untuk mengisi grid)
//       ...Array.from({ length: 42 - firstDayOfWeek - daysInMonth }, (_, i) => ({
//         day: i + 1,
//         month: "next" as const,
//         pmValue: null,
//         isPrediction: false,
//       })),
//     ],
//   };
// };
