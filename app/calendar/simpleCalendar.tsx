// "use client";

// import React, { useState, useEffect, useCallback } from "react";

// interface PM25Data {
//   id: number;
//   station_name: string;
//   latitude: number;
//   longitude: number;
//   date: string;
//   pm25_value: number | null;
//   station: number;
// }

// const SimplePM25Calendar = () => {
//   const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
//   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
//   const [pm25Data, setPM25Data] = useState<PM25Data[]>([]);
//   const [selectedStation, setSelectedStation] = useState<string>("bundaran_hi");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch data realtime (untuk hari ini)
//   const fetchRealtimeData = useCallback(async () => {
//     try {
//       const response = await fetch("/api/pm25-stasiun");
//       if (!response.ok) throw new Error("Failed to fetch realtime PM2.5 data");
//       const data = await response.json();
//       return data;
//     } catch (err) {
//       console.error("Error fetching realtime data:", err);
//       throw err;
//     }
//   }, []);

//   // Fetch data historis
//   const fetchHistoricalData = useCallback(async (date: string) => {
//     try {
//       const response = await fetch("/api/pm25/historis", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ date }),
//       });

//       if (!response.ok) throw new Error("Failed to fetch historical PM2.5 data");
//       const data = await response.json();
//       return data;
//     } catch (err) {
//       console.error(`Error fetching historical data for ${date}:`, err);
//       throw err;
//     }
//   }, []);

//   // Load data untuk bulan yang sedang ditampilkan
//   const loadDataForMonth = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       // 1. Ambil data realtime dulu (untuk hari ini)
//       const realtimeData = await fetchRealtimeData();

//       // 2. Cari tanggal-tanggal di bulan ini yang belum ada datanya
//       const daysInMonth = getDaysInMonth(currentMonth, currentYear);
//       const datesToFetch: string[] = [];
//       const today = new Date();

//       for (let day = 1; day <= daysInMonth; day++) {
//         const date = new Date(currentYear, currentMonth, day);
//         const dateStr = date.toISOString().split("T")[0];

//         // Skip hari ini karena sudah ada di realtime data
//         if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
//           continue;
//         }

//         // Cek apakah data sudah ada
//         const hasData = realtimeData.some((item: PM25Data) => item.date === dateStr);
//         if (!hasData) {
//           datesToFetch.push(dateStr);
//         }
//       }

//       // 3. Fetch data historis untuk tanggal yang belum ada
//       let historicalData: PM25Data[] = [];
//       if (datesToFetch.length > 0) {
//         const responses = await Promise.all(datesToFetch.map((date) => fetchHistoricalData(date)));
//         historicalData = responses.flat();
//       }

//       // 4. Gabungkan semua data
//       setPM25Data([...realtimeData, ...historicalData]);
//     } catch (err) {
//       console.error("Error loading data:", err);
//       setError("Gagal memuat data PM2.5. Silakan coba lagi.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [currentMonth, currentYear, fetchRealtimeData, fetchHistoricalData]);

//   useEffect(() => {
//     loadDataForMonth();
//   }, [currentMonth, currentYear, loadDataForMonth]);

//   // Get days in month
//   const getDaysInMonth = (month: number, year: number) => {
//     return new Date(year, month + 1, 0).getDate();
//   };

//   // Get first day of month (0-6 where 0 is Sunday)
//   const getFirstDayOfMonth = (month: number, year: number) => {
//     return new Date(year, month, 1).getDay();
//   };

//   // Helper function untuk format tanggal lokal
//   const formatLocalDate = (date: Date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   // Get PM2.5 value for a specific date and station
//   const getPM25Value = (date: Date) => {
//     if (!pm25Data.length) return null;

//     const dateString = formatLocalDate(date);
//     const stationData = pm25Data.find((item) => item.date === dateString && item.station_name === selectedStation);
//     return stationData?.pm25_value ?? null;
//   };

//   // Generate calendar data
//   const generateCalendarData = () => {
//     const daysInMonth = getDaysInMonth(currentMonth, currentYear);
//     const firstDayOfWeek = getFirstDayOfMonth(currentMonth, currentYear);
//     const days = [];

//     // Add empty cells for days before the first day of month
//     for (let i = 0; i < firstDayOfWeek; i++) {
//       days.push({ day: null, pm25: null });
//     }

//     // Add days of month with PM2.5 values
//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = new Date(currentYear, currentMonth, day);
//       const pm25 = getPM25Value(date);
//       days.push({ day, pm25 });
//     }

//     return days;
//   };

//   // Get PM2.5 color based on value
//   const getPM25Color = (value: number | null) => {
//     if (value === null) return "bg-gray-300";
//     if (value <= 50) return "bg-green-500";
//     if (value <= 100) return "bg-blue-500";
//     if (value <= 199) return "bg-yellow-500";
//     if (value <= 299) return "bg-red-500";
//     return "bg-gray-900";
//   };

//   // Month names
//   const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

//   // Weekday names
//   const weekdayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

//   // Change month handler
//   const changeMonth = (increment: number) => {
//     const newDate = new Date(currentYear, currentMonth + increment, 1);
//     setCurrentMonth(newDate.getMonth());
//     setCurrentYear(newDate.getFullYear());
//   };

//   // Get unique station names safely
//   const stationNames = pm25Data
//     .map((item) => item?.station_name)
//     .filter((name): name is string => !!name)
//     .filter((name, index, self) => self.indexOf(name) === index);

//   const calendarDays = generateCalendarData();
//   const today = new Date();
//   const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

//   return (
//     <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow">
//       <div className="mb-4">
//         <label htmlFor="station-select" className="block text-sm font-medium text-gray-700 mb-1">
//           Pilih Stasiun:
//         </label>
//         <select id="station-select" value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} className="w-full p-2 border rounded-md">
//           {stationNames.map((name) => (
//             <option key={name} value={name}>
//               {name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="flex justify-between items-center mb-4">
//         <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
//           &lt;
//         </button>
//         <h2 className="text-lg font-semibold">
//           {monthNames[currentMonth]} {currentYear}
//         </h2>
//         <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
//           &gt;
//         </button>
//       </div>

//       {isLoading ? (
//         <div className="text-center py-8">Memuat data PM2.5...</div>
//       ) : error ? (
//         <div className="text-center py-8 text-red-500">{error}</div>
//       ) : (
//         <>
//           <div className="grid grid-cols-7 gap-1 mb-2">
//             {weekdayNames.map((day) => (
//               <div key={day} className="text-center font-medium text-sm py-1">
//                 {day.substring(0, 3)}
//               </div>
//             ))}
//           </div>

//           <div className="grid grid-cols-7 gap-1">
//             {calendarDays.map((dayData, index) => (
//               <div
//                 key={index}
//                 className={`h-16 border rounded flex flex-col items-center justify-center 
//                   ${dayData.day ? "bg-white" : "bg-gray-100"}
//                   ${isCurrentMonth && dayData.day === today.getDate() ? "border-2 border-blue-500" : ""}`}
//               >
//                 {dayData.day && (
//                   <>
//                     <div className="text-sm">{dayData.day}</div>
//                     {dayData.pm25 !== null ? (
//                       <div
//                         className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center 
//                           ${getPM25Color(dayData.pm25)}`}
//                         title={`PM2.5: ${dayData.pm25.toFixed(1)} µg/m³`}
//                       >
//                         {Math.round(dayData.pm25)}
//                       </div>
//                     ) : (
//                       <div className="w-6 h-6 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center" title="Data tidak tersedia">
//                         -
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className="mt-4 p-3 bg-gray-100 rounded">
//             <h3 className="font-semibold mb-2">Keterangan Kualitas Udara (µg/m³):</h3>
//             <div className="flex flex-wrap gap-2">
//               <div className="flex items-center">
//                 <div className="w-4 h-4 rounded-full bg-green-500 mr-1"></div>
//                 <span className="text-sm">0-50 (Baik)</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-4 h-4 rounded-full bg-blue-500 mr-1"></div>
//                 <span className="text-sm">51-100 (Sedang)</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-4 h-4 rounded-full bg-yellow-500 mr-1"></div>
//                 <span className="text-sm">101-199 (Tidak Sehat)</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-4 h-4 rounded-full bg-red-500 mr-1"></div>
//                 <span className="text-sm">200-299 (Sangat Tidak Sehat)</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-4 h-4 rounded-full bg-gray-900 mr-1"></div>
//                 <span className="text-sm">300+ (Berbahaya)</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-4 h-4 rounded-full bg-gray-300 mr-1"></div>
//                 <span className="text-sm">Tidak Tersedia</span>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default SimplePM25Calendar;
