// // "use client";

// // import React, { useState, useEffect, useCallback } from "react";
// // import styles from "./calendar.module.css";
// // import Navbar from "../components/navbar/page";
// // import Image from "next/image";

// // interface PM25Data {
// //   id: number;
// //   station_name: string;
// //   latitude: number;
// //   longitude: number;
// //   date: string;
// //   pm25_value: number | null;
// //   station: number;
// // }

// // interface WeatherData {
// //   id: number;
// //   temperature: number;
// //   precipitation: number;
// //   humidity: number;
// //   wind_dir: number;
// //   wind_speed: number;
// //   station_name: string;
// //   latitude: number;
// //   longitude: number;
// // }

// // interface CalendarProps {
// //   location?: string;
// //   isSplitView?: boolean;
// //   showRightPanel?: boolean;
// //   showHeader?: boolean;
// //   splitViewContainer?: string;
// // }

// // const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
// // const DEFAULT_STATION = "bundaran_hi";

// // const CalendarPage: React.FC<CalendarProps> = ({ location, isSplitView, showRightPanel = true, showHeader = true, splitViewContainer }) => {
// //   const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
// //   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
// //   const [pm25Data, setPM25Data] = useState<PM25Data[]>([]);
// //   const [selectedStation, setSelectedStation] = useState<string>(location || DEFAULT_STATION);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
// //   const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
// //   const [weatherError, setWeatherError] = useState<string | null>(null);
// //   const [allWeatherStations, setAllWeatherStations] = useState<WeatherData[]>([]);
// //   const currentDate = new Date();
// //   const [selectedDate, setSelectedDate] = useState<Date>(new Date());

// //   useEffect(() => {
// //     if (location && location !== selectedStation) {
// //       setSelectedStation(location);
// //     }
// //   }, [location]);

// //   const getPMColor = (value: number | null): string => {
// //     if (value === null) return "#CCCCCC";
// //     if (value <= 50) return "#00CC00";
// //     if (value <= 100) return "#0133FF";
// //     if (value <= 199) return "#FFC900";
// //     if (value <= 299) return "#FF0000";
// //     return "#222222";
// //   };

// //   const getPMImage = (value: number | null): string => {
// //     if (value === null) return "/images/indikator_tidak_tersedia.png";
// //     if (value <= 50) return "/images/indikator_baik.png";
// //     if (value <= 100) return "/images/indikator_sedang.png";
// //     if (value <= 199) return "/images/indikator_tidak_sehat.png";
// //     if (value <= 299) return "/images/indikator_sangat_tidak_sehat.png";
// //     return "/images/indikator_berbahaya.png";
// //   };

// //   const getActivityRecommendation = (pmValue: number | null): string => {
// //     if (pmValue === null) return "Data kualitas udara tidak tersedia";
// //     if (pmValue <= 50) return "Aman untuk beraktivitas di luar rumah";
// //     if (pmValue <= 100) return "Boleh beraktivitas di luar dengan masker";
// //     if (pmValue <= 199) return "Hindari aktivitas luar terlalu lama, gunakan masker";
// //     if (pmValue <= 299) return "Batasi aktivitas luar, gunakan masker N95";
// //     return "Hindari semua aktivitas di luar rumah";
// //   };

// //   const handleDateClick = (day: number) => {
// //     const clickedDate = new Date(currentYear, currentMonth, day);
// //     setSelectedDate(clickedDate);
// //   };

// //   const formatDate = (date: Date): string => {
// //     const day = date.getDate();
// //     const month = MONTHS[date.getMonth()];
// //     const year = date.getFullYear();
// //     return `${day} ${month} ${year}`;
// //   };

// //   const formatStationName = (name: string): string => {
// //     return name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
// //   };

// //   // Format tanggal untuk API
// //   const formatLocalDate = (date: Date): string => {
// //     const year = date.getFullYear();
// //     const month = String(date.getMonth() + 1).padStart(2, "0");
// //     const day = String(date.getDate()).padStart(2, "0");
// //     return `${year}-${month}-${day}`;
// //   };

// //   // Fetch data realtime PM2.5
// //   const fetchRealtimePM25Data = useCallback(async () => {
// //     try {
// //       const response = await fetch("/api/pm25-aktual");
// //       if (!response.ok) throw new Error("Failed to fetch realtime PM2.5 data");
// //       const data = await response.json();
// //       return data;
// //     } catch (err) {
// //       console.error("Error fetching realtime PM2.5 data:", err);
// //       throw err;
// //     }
// //   }, []);

// //   // Fetch data historis PM2.5
// //   const fetchHistoricalPM25Data = useCallback(async (date: string) => {
// //     try {
// //       const response = await fetch("/api/pm25-aktual/pm25-aktual-by-date", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ date }),
// //       });

// //       if (!response.ok) throw new Error(`Failed to fetch historical PM2.5 data for ${date}`);
// //       const data = await response.json();
// //       return data;
// //     } catch (err) {
// //       console.error(`Error fetching historical PM2.5 data for ${date}:`, err);
// //       throw err;
// //     }
// //   }, []);

// //   // Fetch data cuaca (realtime atau historis)
// //   const fetchWeatherData = useCallback(
// //     async (date: string) => {
// //       setIsWeatherLoading(true);
// //       setWeatherError(null);

// //       try {
// //         const isToday = date === formatLocalDate(new Date()) && new Date(date).getDate() === new Date().getDate() && new Date(date).getMonth() === new Date().getMonth() && new Date(date).getFullYear() === new Date().getFullYear();

// //         const url = isToday ? "/api/weather" : "/api/weather/weather-by-date";
// //         const body = isToday ? undefined : JSON.stringify({ date });

// //         const response = await fetch(url, {
// //           method: isToday ? "GET" : "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body,
// //           cache: "no-store",
// //         });

// //         if (!response.ok) {
// //           throw new Error(`Failed to fetch weather data for ${date}`);
// //         }

// //         const data = await response.json();
// //         if (data.error) {
// //           throw new Error(data.error);
// //         }

// //         setAllWeatherStations(data);
// //         const station = data.find((s: WeatherData) => s.station_name === selectedStation) || data[0];
// //         setWeatherData(station);
// //       } catch (error) {
// //         console.error(`Error fetching weather data for ${date}:`, error);
// //         setWeatherError(error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil data cuaca");
// //       } finally {
// //         setIsWeatherLoading(false);
// //       }
// //     },
// //     [selectedStation]
// //   );

// //   // Load data untuk bulan yang sedang ditampilkan
// //   const loadDataForMonth = useCallback(async () => {
// //     setIsLoading(true);
// //     setError(null);

// //     try {
// //       const today = new Date();
// //       const todayStr = formatLocalDate(today);

// //       // Ambil data realtime untuk hari ini
// //       const realtimeData = await fetchRealtimePM25Data();

// //       // Cari tanggal-tanggal di bulan ini
// //       const daysInMonth = getDaysInMonth(currentMonth, currentYear);
// //       const datesToFetch: string[] = [];

// //       // Selalu ambil data untuk semua tanggal di bulan saat ini, kecuali hari ini
// //       for (let day = 1; day <= daysInMonth; day++) {
// //         const date = new Date(currentYear, currentMonth, day);
// //         const dateStr = formatLocalDate(date);

// //         // Skip hari ini karena sudah ada di realtime data
// //         if (dateStr === todayStr) {
// //           continue;
// //         }

// //         datesToFetch.push(dateStr);
// //       }

// //       // Fetch data historis untuk tanggal yang belum ada
// //       let historicalData: PM25Data[] = [];
// //       if (datesToFetch.length > 0) {
// //         const responses = await Promise.all(datesToFetch.map((date) => fetchHistoricalPM25Data(date)));
// //         historicalData = responses.flat();
// //       }

// //       // Gabungkan data realtime dan historis
// //       const combinedData = [...realtimeData, ...historicalData];
// //       setPM25Data(combinedData);
// //     } catch (err) {
// //       console.error("Error loading PM2.5 data:", err);
// //       setError("Gagal memuat data PM2.5. Silakan coba lagi.");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   }, [currentMonth, currentYear, selectedStation, fetchRealtimePM25Data, fetchHistoricalPM25Data]);

// //   // Load data PM2.5 saat bulan, tahun, atau stasiun Catt
// //   useEffect(() => {
// //     loadDataForMonth();
// //   }, [currentMonth, currentYear, selectedStation, loadDataForMonth]);

// //   // Load data cuaca saat tanggal atau stasiun berubah
// //   useEffect(() => {
// //     fetchWeatherData(formatLocalDate(selectedDate));
// //   }, [selectedDate, selectedStation, fetchWeatherData]);

// //   const getDaysInMonth = (month: number, year: number) => {
// //     return new Date(year, month + 1, 0).getDate();
// //   };

// //   const getFirstDayOfMonth = (month: number, year: number) => {
// //     return new Date(year, month, 1).getDay();
// //   };

// //   // Get PM2.5 value for a specific date and station
// //   const getPM25Value = (date: Date) => {
// //     if (!pm25Data.length) return null;

// //     const dateString = formatLocalDate(date);
// //     const stationData = pm25Data.find((item) => item.date === dateString && item.station_name === selectedStation);
// //     return stationData?.pm25_value ?? null;
// //   };

// //   // Generate calendar data
// //   const generateCalendarData = () => {
// //     const daysInMonth = getDaysInMonth(currentMonth, currentYear);
// //     const firstDayOfWeek = getFirstDayOfMonth(currentMonth, currentYear);
// //     const days = [];

// //     // Add empty cells for days before the first day of month
// //     for (let i = 0; i < firstDayOfWeek; i++) {
// //       days.push({ day: null, pm25: null });
// //     }

// //     for (let day = 1; day <= daysInMonth; day++) {
// //       const date = new Date(currentYear, currentMonth, day);
// //       const pm25 = getPM25Value(date);
// //       days.push({ day, pm25 });
// //     }

// //     return days;
// //   };

// //   const changeMonth = (increment: number) => {
// //     const newDate = new Date(currentYear, currentMonth + increment, 1);
// //     setCurrentMonth(newDate.getMonth());
// //     setCurrentYear(newDate.getFullYear());
// //   };

// //   const stationNames = pm25Data
// //     .map((item) => item?.station_name)
// //     .filter((name): name is string => !!name)
// //     .filter((name, index, self) => self.indexOf(name) === index);

// //   const calendarDays = generateCalendarData();
// //   const today = new Date();
// //   const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
// //   const selectedPMValue = getPM25Value(selectedDate);

// //   const renderQualityBox = () => {
// //     if (isLoading) {
// //       return (
// //         <div className={styles.qualityBox}>
// //           <div className="flex items-center justify-center gap-4">
// //             <div className={styles.spinner}></div>
// //             <span>Memuat data PM2.5...</span>
// //           </div>
// //         </div>
// //       );
// //     }

// //     if (error) {
// //       return (
// //         <div className={styles.qualityBox}>
// //           <div className={styles.error}>{error}</div>
// //         </div>
// //       );
// //     }

// //     return (
// //       <div className={styles.qualityBox}>
// //         <div className={styles.qualityBoxIndicator}>
// //           <Image src={getPMImage(selectedPMValue)} alt="indikator kualitas udara" width={70} height={70} />
// //           <div>
// //             <p style={{ fontSize: "25px", fontWeight: "bolder" }}>{selectedPMValue !== null ? selectedPMValue.toFixed(1) : "N/A"}</p>
// //             <p style={{ fontSize: "15px" }}>µg/m³</p>
// //           </div>
// //         </div>
// //         <p>Kategori</p>
// //         <strong>
// //           {selectedPMValue === null ? "DATA TIDAK TERSEDIA" : selectedPMValue <= 50 ? "BAIK" : selectedPMValue <= 100 ? "SEDANG" : selectedPMValue <= 199 ? "TIDAK SEHAT" : selectedPMValue <= 299 ? "SANGAT TIDAK SEHAT" : "BERBAHAYA"}
// //         </strong>
// //       </div>
// //     );
// //   };

// //   const renderLegend = () => (
// //     <div className={styles.legend}>
// //       <h3>Keterangan (µg/m³)</h3>
// //       {[
// //         {
// //           range: "0-50",
// //           color: "#00CC00",
// //           label: "Baik",
// //           desc: "Tingkat kualitas udara yang tidak memberikan efek bagi kesehatan manusia atau hewan dan tidak berpengaruh pada tumbuhan, bangunan ataupun nilai estetika",
// //         },
// //         {
// //           range: "51-100",
// //           color: "#0133FF",
// //           label: "Sedang",
// //           desc: "Tingkat kualitas udara yang tidak berpengaruh pada kesehatan manusia ataupun hewan tetapi berpengaruh pada tumbuhan yang sensitif, dan nilai estetika",
// //         },
// //         {
// //           range: "101-199",
// //           color: "#FFC900",
// //           label: "Tidak Sehat",
// //           desc: "Tingkat kualitas udara yang bersifat merugikan pada manusia ataupun kelompok hewan yang sensitif atau bisa menimbulkan kerusakan pada tumbuhan ataupun nilai estetika",
// //         },
// //         {
// //           range: "200-299",
// //           color: "#FF0000",
// //           label: "Sangat Tidak Sehat",
// //           desc: "Tingkat kualitas udara yang dapat merugikan kesehatan pada sejumlah segmen populasi yang terpapar",
// //         },
// //         {
// //           range: "300-500",
// //           color: "#222222",
// //           label: "Berbahaya",
// //           desc: "Tingkat kualitas udara berbahaya yang secara umum dapat merugikan kesehatan yang serius pada populasi",
// //         },
// //       ].map((item, index) => (
// //         <div key={index} className={styles.legendItem}>
// //           <div className={styles.legendHeader}>
// //             <span>{item.range}</span>
// //             <span style={{ backgroundColor: item.color }}>{item.label}</span>
// //           </div>
// //           <p>{item.desc}</p>
// //         </div>
// //       ))}
// //     </div>
// //   );

// //   const renderWeatherTable = () => (
// //     <div className={styles.weather}>
// //       <div className={styles.weatherHeader}>
// //         <h3>Data Cuaca {selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear() ? "Hari Ini" : formatDate(selectedDate)}</h3>
// //       </div>
// //       <table>
// //         <thead>
// //           <tr>
// //             <th>Suhu (°C)</th>
// //             <th>Curah hujan (mm)</th>
// //             <th>Kelembaban (%)</th>
// //             <th>Arah angin (°)</th>
// //             <th>Kec. angin (m/s)</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {isWeatherLoading ? (
// //             <tr>
// //               <td colSpan={5} className={styles.loadingRow}>
// //                 <div className="flex items-center justify-center gap-4">
// //                   <div className={styles.spinner}></div>
// //                   <span>Memuat data cuaca...</span>
// //                 </div>
// //               </td>
// //             </tr>
// //           ) : weatherError ? (
// //             <tr>
// //               <td colSpan={5} className={styles.errorRow}>
// //                 {weatherError}
// //                 <button onClick={() => fetchWeatherData(formatLocalDate(selectedDate))} className={styles.retryButton}>
// //                   Coba Lagi
// //                 </button>
// //               </td>
// //             </tr>
// //           ) : weatherData ? (
// //             <tr>
// //               <td>{weatherData.temperature.toFixed(1)}</td>
// //               <td>{weatherData.precipitation.toFixed(1)}</td>
// //               <td>{weatherData.humidity.toFixed(1)}</td>
// //               <td>{weatherData.wind_dir.toFixed(1)}</td>
// //               <td>{weatherData.wind_speed.toFixed(1)}</td>
// //             </tr>
// //           ) : (
// //             <tr>
// //               <td colSpan={5}>Data cuaca tidak tersedia</td>
// //             </tr>
// //           )}
// //         </tbody>
// //       </table>
// //     </div>
// //   );

// //   return (
// //     <>
// //       {!isSplitView && showHeader && <Navbar />}
// //       <div className={`${styles.container} ${isSplitView ? styles.isSplitView : ""} ${splitViewContainer || ""}`}>
// //         <div className={styles.content}>
// //           <div className={styles.left}>
// //             <div className={styles.location}>
// //               <div className={styles.locationIcon}>📍</div>
// //               <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} className={styles.stationSelector} disabled={isLoading}>
// //                 {stationNames.map((name) => (
// //                   <option key={name} value={name}>
// //                     {formatStationName(name)}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //             <div className={styles.date}>
// //               📅 {selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear() ? "Hari ini" : "Tanggal terpilih"}: {formatDate(selectedDate)}
// //             </div>
// //             <p>Data PM2.5 (µg/m³)</p>

// //             <div className="mb-4">
// //               <div className="flex justify-between items-center mb-2">
// //                 <div className={styles.monthYearSelector}>
// //                   <select value={currentMonth} onChange={(e) => setCurrentMonth(parseInt(e.target.value))} className={styles.monthSelector}>
// //                     {MONTHS.map((month, index) => (
// //                       <option key={month} value={index}>
// //                         {month}
// //                       </option>
// //                     ))}
// //                   </select>

// //                   <select value={currentYear} onChange={(e) => setCurrentYear(parseInt(e.target.value))} className={styles.yearSelector}>
// //                     {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map((year) => (
// //                       <option key={year} value={year}>
// //                         {year}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>
// //               </div>
// //               {isLoading ? (
// //                 <div className="text-center py-8 flex items-center justify-center gap-4">
// //                   <div className={styles.spinner}></div>
// //                   <span>Memuat data PM2.5...</span>
// //                 </div>
// //               ) : error ? (
// //                 <div className="text-center py-8 text-red-500">{error}</div>
// //               ) : (
// //                 <div className={styles.calendarGrid}>
// //                   {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day) => (
// //                     <div key={day} className={styles.dayName}>
// //                       {day.substring(0, 3)}
// //                     </div>
// //                   ))}
// //                   {calendarDays.map((dayData, index) => (
// //                     <div
// //                       key={index}
// //                       className={`${styles.dayCell} ${dayData.day ? "" : styles.otherMonthDay} ${isCurrentMonth && dayData.day === today.getDate() ? styles.today : ""} ${
// //                         dayData.day && selectedDate.getDate() === dayData.day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear ? styles.selectedDate : ""
// //                       }`}
// //                       onClick={() => dayData.day && handleDateClick(dayData.day)}
// //                       style={{ cursor: dayData.day ? "pointer" : "default" }}
// //                     >
// //                       {dayData.day && (
// //                         <>
// //                           <div className={styles.dateNumber}>{dayData.day}</div>
// //                           <div className={styles.indikatorPMContainer}>
// //                             <div
// //                               className={styles.indikatorPM}
// //                               style={{
// //                                 backgroundColor: getPMColor(dayData.pm25),
// //                               }}
// //                             >
// //                               <span className={styles.pmValue}>{dayData.pm25 !== null ? Math.round(dayData.pm25) : "-"}</span>
// //                             </div>
// //                             <div className={styles.dataLabel}>{dayData.pm25 !== null ? "Aktual" : "No Data"}</div>
// //                           </div>
// //                         </>
// //                       )}
// //                     </div>
// //                   ))}
// //                 </div>
// //               )}
// //             </div>
// //           </div>

// //           {showRightPanel && (
// //             <div className={styles.right}>
// //               <div className={styles.infromationPM}>
// //                 {renderQualityBox()}
// //                 <div className={styles.activityRec}>
// //                   <b>Kegiatan yang direkomendasikan</b>
// //                   <p>{getActivityRecommendation(selectedPMValue)}</p>
// //                 </div>
// //               </div>
// //               {renderLegend()}
// //               {renderWeatherTable()}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default CalendarPage;

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import styles from "./calendar.module.css";
// import Navbar from "../components/navbar/page";
// import Image from "next/image";

// interface PM25Data {
//   id: number;
//   station_name: string;
//   latitude: number;
//   longitude: number;
//   date: string;
//   pm25_value: number | null;
//   station: number;
// }

// interface WeatherData {
//   id: number;
//   temperature: number;
//   precipitation: number;
//   humidity: number;
//   wind_dir: number;
//   wind_speed: number;
//   station_name: string;
//   latitude: number;
//   longitude: number;
// }

// interface CalendarProps {
//   location?: string;
//   isSplitView?: boolean;
//   showRightPanel?: boolean;
//   showHeader?: boolean;
//   splitViewContainer?: string;
// }

// const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
// const DEFAULT_STATION = "bundaran_hi";

// const CalendarPage: React.FC<CalendarProps> = ({ location, isSplitView, showRightPanel = true, showHeader = true, splitViewContainer }) => {
//   const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
//   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
//   const [pm25Data, setPM25Data] = useState<PM25Data[]>([]);
//   const [selectedStation, setSelectedStation] = useState<string>(location || DEFAULT_STATION);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
//   const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
//   const [weatherError, setWeatherError] = useState<string | null>(null);
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());

//   useEffect(() => {
//     if (location && location !== selectedStation) {
//       setSelectedStation(location);
//     }
//   }, [location]);

//   const getPMColor = (value: number | null): string => {
//     if (value === null) return "#CCCCCC";
//     if (value <= 50) return "#00CC00";
//     if (value <= 100) return "#0133FF";
//     if (value <= 199) return "#FFC900";
//     if (value <= 299) return "#FF0000";
//     return "#222222";
//   };

//   const getPMImage = (value: number | null): string => {
//     if (value === null) return "/images/indikator_tidak_tersedia.png";
//     if (value <= 50) return "/images/indikator_baik.png";
//     if (value <= 100) return "/images/indikator_sedang.png";
//     if (value <= 199) return "/images/indikator_tidak_sehat.png";
//     if (value <= 299) return "/images/indikator_sangat_tidak_sehat.png";
//     return "/images/indikator_berbahaya.png";
//   };

//   const getActivityRecommendation = (pmValue: number | null): string => {
//     if (pmValue === null) return "Data kualitas udara tidak tersedia";
//     if (pmValue <= 50) return "Aman untuk beraktivitas di luar rumah";
//     if (pmValue <= 100) return "Boleh beraktivitas di luar dengan masker";
//     if (pmValue <= 199) return "Hindari aktivitas luar terlalu lama, gunakan masker";
//     if (pmValue <= 299) return "Batasi aktivitas luar, gunakan masker N95";
//     return "Hindari semua aktivitas di luar rumah";
//   };

//   const handleDateClick = (day: number) => {
//     const clickedDate = new Date(currentYear, currentMonth, day);
//     setSelectedDate(clickedDate);
//   };

//   const formatDate = (date: Date): string => {
//     const day = date.getDate();
//     const month = MONTHS[date.getMonth()];
//     const year = date.getFullYear();
//     return `${day} ${month} ${year}`;
//   };

//   const formatStationName = (name: string): string => {
//     return name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
//   };

//   // Format tanggal untuk API
//   const formatLocalDate = (date: Date): string => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   // Fetch data realtime PM2.5
//   const fetchRealtimePM25Data = useCallback(async () => {
//     try {
//       const response = await fetch("/api/pm25-aktual");
//       if (!response.ok) throw new Error("Failed to fetch realtime PM2.5 data");
//       const data = await response.json();
//       return data;
//     } catch (err) {
//       console.error("Error fetching realtime PM2.5 data:", err);
//       throw err;
//     }
//   }, []);

//   // Fetch data historis PM2.5
//   const fetchHistoricalPM25Data = useCallback(async (date: string) => {
//     try {
//       const response = await fetch("/api/pm25-aktual/pm25-aktual-by-date", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ date }),
//       });

//       if (!response.ok) throw new Error(`Failed to fetch historical PM2.5 data for ${date}`);
//       const data = await response.json();
//       return data;
//     } catch (err) {
//       console.error(`Error fetching historical PM2.5 data for ${date}:`, err);
//       throw err;
//     }
//   }, []);

//   // Fetch data cuaca (realtime atau historis)
//   const fetchWeatherData = useCallback(
//     async (date: string) => {
//       setIsWeatherLoading(true);
//       setWeatherError(null);

//       try {
//         const isToday = date === formatLocalDate(new Date()) && new Date(date).getDate() === new Date().getDate() && new Date(date).getMonth() === new Date().getMonth() && new Date(date).getFullYear() === new Date().getFullYear();

//         const url = isToday ? "/api/weather" : "/api/weather/weather-by-date";
//         const body = isToday ? undefined : JSON.stringify({ date });

//         const response = await fetch(url, {
//           method: isToday ? "GET" : "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body,
//           cache: "no-store",
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch weather data for ${date}`);
//         }

//         const data = await response.json();
//         if (data.error) {
//           throw new Error(data.error);
//         }

//         const station = data.find((s: WeatherData) => s.station_name === selectedStation) || data[0];
//         setWeatherData(station);
//       } catch (error) {
//         console.error(`Error fetching weather data for ${date}:`, error);
//         setWeatherError(error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil data cuaca");
//       } finally {
//         setIsWeatherLoading(false);
//       }
//     },
//     [selectedStation]
//   );

//   // Load data untuk bulan yang sedang ditampilkan
//   const loadDataForMonth = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const today = new Date();
//       const todayStr = formatLocalDate(today);

//       // Ambil data realtime untuk hari ini
//       const realtimeData = await fetchRealtimePM25Data();

//       // Cari tanggal-tanggal di bulan ini
//       const daysInMonth = getDaysInMonth(currentMonth, currentYear);
//       const datesToFetch: string[] = [];

//       // Selalu ambil data untuk semua tanggal di bulan saat ini, kecuali hari ini
//       for (let day = 1; day <= daysInMonth; day++) {
//         const date = new Date(currentYear, currentMonth, day);
//         const dateStr = formatLocalDate(date);

//         // Skip hari ini karena sudah ada di realtime data
//         if (dateStr === todayStr) {
//           continue;
//         }

//         datesToFetch.push(dateStr);
//       }

//       // Fetch data historis untuk tanggal yang belum ada
//       let historicalData: PM25Data[] = [];
//       if (datesToFetch.length > 0) {
//         const responses = await Promise.all(datesToFetch.map((date) => fetchHistoricalPM25Data(date)));
//         historicalData = responses.flat();
//       }

//       // Gabungkan data realtime dan historis
//       const combinedData = [...realtimeData, ...historicalData];
//       setPM25Data(combinedData);
//     } catch (err) {
//       console.error("Error loading PM2.5 data:", err);
//       setError("Gagal memuat data PM2.5. Silakan coba lagi.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [currentMonth, currentYear, selectedStation, fetchRealtimePM25Data, fetchHistoricalPM25Data]);

//   // Load data PM2.5 saat bulan, tahun, atau stasiun berubah
//   useEffect(() => {
//     loadDataForMonth();
//   }, [currentMonth, currentYear, selectedStation, loadDataForMonth]);

//   // Load data cuaca saat tanggal atau stasiun berubah
//   useEffect(() => {
//     fetchWeatherData(formatLocalDate(selectedDate));
//   }, [selectedDate, selectedStation, fetchWeatherData]);

//   const getDaysInMonth = (month: number, year: number) => {
//     return new Date(year, month + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (month: number, year: number) => {
//     return new Date(year, month, 1).getDay();
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

//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = new Date(currentYear, currentMonth, day);
//       const pm25 = getPM25Value(date);
//       days.push({ day, pm25 });
//     }

//     return days;
//   };

//   const stationNames = pm25Data
//     .map((item) => item?.station_name)
//     .filter((name): name is string => !!name)
//     .filter((name, index, self) => self.indexOf(name) === index);

//   const calendarDays = generateCalendarData();
//   const today = new Date();
//   const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
//   const selectedPMValue = getPM25Value(selectedDate);

//   const renderQualityBox = () => {
//     if (isLoading) {
//       return (
//         <div className={styles.qualityBox}>
//           <div className="flex items-center justify-center gap-4">
//             <div className={styles.spinner}></div>
//             <span>Memuat data PM2.5...</span>
//           </div>
//         </div>
//       );
//     }

//     if (error) {
//       return (
//         <div className={styles.qualityBox}>
//           <div className={styles.error}>{error}</div>
//         </div>
//       );
//     }

//     return (
//       <div className={styles.qualityBox}>
//         <div className={styles.qualityBoxIndicator}>
//           <Image src={getPMImage(selectedPMValue)} alt="indikator kualitas udara" width={70} height={70} />
//           <div>
//             <p style={{ fontSize: "25px", fontWeight: "bolder" }}>{selectedPMValue !== null ? selectedPMValue.toFixed(1) : "N/A"}</p>
//             <p style={{ fontSize: "15px" }}>µg/m³</p>
//           </div>
//         </div>
//         <p>Kategori</p>
//         <strong>
//           {selectedPMValue === null ? "DATA TIDAK TERSEDIA" : selectedPMValue <= 50 ? "BAIK" : selectedPMValue <= 100 ? "SEDANG" : selectedPMValue <= 199 ? "TIDAK SEHAT" : selectedPMValue <= 299 ? "SANGAT TIDAK SEHAT" : "BERBAHAYA"}
//         </strong>
//       </div>
//     );
//   };

//   const renderLegend = () => (
//     <div className={styles.legend}>
//       <h3>Keterangan (µg/m³)</h3>
//       {[
//         {
//           range: "0-50",
//           color: "#00CC00",
//           label: "Baik",
//           desc: "Tingkat kualitas udara yang tidak memberikan efek bagi kesehatan manusia atau hewan dan tidak berpengaruh pada tumbuhan, bangunan ataupun nilai estetika",
//         },
//         {
//           range: "51-100",
//           color: "#0133FF",
//           label: "Sedang",
//           desc: "Tingkat kualitas udara yang tidak berpengaruh pada kesehatan manusia ataupun hewan tetapi berpengaruh pada tumbuhan yang sensitif, dan nilai estetika",
//         },
//         {
//           range: "101-199",
//           color: "#FFC900",
//           label: "Tidak Sehat",
//           desc: "Tingkat kualitas udara yang bersifat merugikan pada manusia ataupun kelompok hewan yang sensitif atau bisa menimbulkan kerusakan pada tumbuhan ataupun nilai estetika",
//         },
//         {
//           range: "200-299",
//           color: "#FF0000",
//           label: "Sangat Tidak Sehat",
//           desc: "Tingkat kualitas udara yang dapat merugikan kesehatan pada sejumlah segmen populasi yang terpapar",
//         },
//         {
//           range: "300-500",
//           color: "#222222",
//           label: "Berbahaya",
//           desc: "Tingkat kualitas udara berbahaya yang secara umum dapat merugikan kesehatan yang serius pada populasi",
//         },
//       ].map((item, index) => (
//         <div key={index} className={styles.legendItem}>
//           <div className={styles.legendHeader}>
//             <span>{item.range}</span>
//             <span style={{ backgroundColor: item.color }}>{item.label}</span>
//           </div>
//           <p>{item.desc}</p>
//         </div>
//       ))}
//     </div>
//   );

//   const renderWeatherTable = () => (
//     <div className={styles.weather}>
//       <div className={styles.weatherHeader}>
//         <h3>Data Cuaca {selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear() ? "Hari Ini" : formatDate(selectedDate)}</h3>
//       </div>
//       <table>
//         <thead>
//           <tr>
//             <th>Suhu (°C)</th>
//             <th>Curah hujan (mm)</th>
//             <th>Kelembaban (%)</th>
//             <th>Arah angin (°)</th>
//             <th>Kec. angin (m/s)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {isWeatherLoading ? (
//             <tr>
//               <td colSpan={5} className={styles.loadingRow}>
//                 <div className="flex items-center justify-center gap-4">
//                   <div className={styles.spinner}></div>
//                   <span>Memuat data cuaca...</span>
//                 </div>
//               </td>
//             </tr>
//           ) : weatherError ? (
//             <tr>
//               <td colSpan={5} className={styles.errorRow}>
//                 {weatherError}
//                 <button onClick={() => fetchWeatherData(formatLocalDate(selectedDate))} className={styles.retryButton}>
//                   Coba Lagi
//                 </button>
//               </td>
//             </tr>
//           ) : weatherData ? (
//             <tr>
//               <td>{weatherData.temperature.toFixed(1)}</td>
//               <td>{weatherData.precipitation.toFixed(1)}</td>
//               <td>{weatherData.humidity.toFixed(1)}</td>
//               <td>{weatherData.wind_dir.toFixed(1)}</td>
//               <td>{weatherData.wind_speed.toFixed(1)}</td>
//             </tr>
//           ) : (
//             <tr>
//               <td colSpan={5}>Data cuaca tidak tersedia</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );

//   return (
//     <>
//       {!isSplitView && showHeader && <Navbar />}
//       <div className={`${styles.container} ${isSplitView ? styles.isSplitView : ""} ${splitViewContainer || ""}`}>
//         <div className={styles.content}>
//           <div className={styles.left}>
//             <div className={styles.location}>
//               <div className={styles.locationIcon}>📍</div>
//               <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} className={styles.stationSelector} disabled={isLoading}>
//                 {stationNames.map((name) => (
//                   <option key={name} value={name}>
//                     {formatStationName(name)}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className={styles.date}>
//               📅 {selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear() ? "Hari ini" : "Tanggal terpilih"}: {formatDate(selectedDate)}
//             </div>
//             <p>Data PM2.5 (µg/m³)</p>

//             <div className="mb-4">
//               <div className="flex justify-between items-center mb-2">
//                 <div className={styles.monthYearSelector}>
//                   <select value={currentMonth} onChange={(e) => setCurrentMonth(parseInt(e.target.value))} className={styles.monthSelector}>
//                     {MONTHS.map((month, index) => (
//                       <option key={month} value={index}>
//                         {month}
//                       </option>
//                     ))}
//                   </select>

//                   <select value={currentYear} onChange={(e) => setCurrentYear(parseInt(e.target.value))} className={styles.yearSelector}>
//                     {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map((year) => (
//                       <option key={year} value={year}>
//                         {year}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               {isLoading ? (
//                 <div className="text-center py-8 flex items-center justify-center gap-4">
//                   <div className={styles.spinner}></div>
//                   <span>Memuat data PM2.5...</span>
//                 </div>
//               ) : error ? (
//                 <div className="text-center py-8 text-red-500">{error}</div>
//               ) : (
//                 <div className={styles.calendarGrid}>
//                   {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day) => (
//                     <div key={day} className={styles.dayName}>
//                       {day.substring(0, 3)}
//                     </div>
//                   ))}
//                   {calendarDays.map((dayData, index) => (
//                     <div
//                       key={index}
//                       className={`${styles.dayCell} ${dayData.day ? "" : styles.otherMonthDay} ${isCurrentMonth && dayData.day === today.getDate() ? styles.today : ""} ${
//                         dayData.day && selectedDate.getDate() === dayData.day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear ? styles.selectedDate : ""
//                       }`}
//                       onClick={() => dayData.day && handleDateClick(dayData.day)}
//                       style={{ cursor: dayData.day ? "pointer" : "default" }}
//                     >
//                       {dayData.day && (
//                         <>
//                           <div className={styles.dateNumber}>{dayData.day}</div>
//                           <div className={styles.indikatorPMContainer}>
//                             <div
//                               className={styles.indikatorPM}
//                               style={{
//                                 backgroundColor: getPMColor(dayData.pm25),
//                               }}
//                             >
//                               <span className={styles.pmValue}>{dayData.pm25 !== null ? Math.round(dayData.pm25) : "-"}</span>
//                             </div>
//                             <div className={styles.dataLabel}>{dayData.pm25 !== null ? "Aktual" : "No Data"}</div>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {showRightPanel && (
//             <div className={styles.right}>
//               <div className={styles.infromationPM}>
//                 {renderQualityBox()}
//                 <div className={styles.activityRec}>
//                   <b>Kegiatan yang direkomendasikan</b>
//                   <p>{getActivityRecommendation(selectedPMValue)}</p>
//                 </div>
//               </div>
//               {renderLegend()}
//               {renderWeatherTable()}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default CalendarPage;

"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./calendar.module.css";
import Image from "next/image";

interface PM25Data {
  id: number;
  station_name: string;
  latitude: number;
  longitude: number;
  date: string;
  pm25_value: number | null;
  station: number;
}

interface WeatherData {
  id: number;
  temperature: number;
  precipitation: number;
  humidity: number;
  wind_dir: number;
  wind_speed: number;
  station_name: string;
  latitude: number;
  longitude: number;
}

interface CalendarProps {
  location?: string;
  isSplitView?: boolean;
  showRightPanel?: boolean;
  // showHeader?: boolean;
  splitViewContainer?: string;
}

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DEFAULT_STATION = "bundaran_hi";

const Calendar: React.FC<CalendarProps> = ({ location, isSplitView = false, showRightPanel = true, splitViewContainer }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [pm25Data, setPM25Data] = useState<PM25Data[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>(location || DEFAULT_STATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (location && location !== selectedStation) {
      setSelectedStation(location);
    }
  }, [location]);

  const getPMColor = (value: number | null): string => {
    if (value === null) return "#CCCCCC";
    if (value <= 50) return "#00CC00";
    if (value <= 100) return "#0133FF";
    if (value <= 199) return "#FFC900";
    if (value <= 299) return "#FF0000";
    return "#222222";
  };

  const getPMImage = (value: number | null): string => {
    if (value === null) return "/images/indikator_tidak_tersedia.png";
    if (value <= 50) return "/images/indikator_baik.png";
    if (value <= 100) return "/images/indikator_sedang.png";
    if (value <= 199) return "/images/indikator_tidak_sehat.png";
    if (value <= 299) return "/images/indikator_sangat_tidak_sehat.png";
    return "/images/indikator_berbahaya.png";
  };

  const getActivityRecommendation = (pmValue: number | null): string => {
    if (pmValue === null) return "Data kualitas udara tidak tersedia";
    if (pmValue <= 50) return "Aman untuk beraktivitas di luar rumah";
    if (pmValue <= 100) return "Boleh beraktivitas di luar dengan masker";
    if (pmValue <= 199) return "Hindari aktivitas luar terlalu lama, gunakan masker";
    if (pmValue <= 299) return "Batasi aktivitas luar, gunakan masker N95";
    return "Hindari semua aktivitas di luar rumah";
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(clickedDate);
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatStationName = (name: string): string => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchRealtimePM25Data = useCallback(async () => {
    try {
      const response = await fetch("/api/pm25-aktual");
      if (!response.ok) throw new Error("Failed to fetch realtime PM2.5 data");
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching realtime PM2.5 data:", err);
      throw err;
    }
  }, []);

  const fetchHistoricalPM25Data = useCallback(async (date: string) => {
    try {
      const response = await fetch("/api/pm25-aktual/pm25-aktual-by-date", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date }),
      });

      if (!response.ok) throw new Error(`Failed to fetch historical PM2.5 data for ${date}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Error fetching historical PM2.5 data for ${date}:`, err);
      throw err;
    }
  }, []);

  const fetchWeatherData = useCallback(
    async (date: string) => {
      setIsWeatherLoading(true);
      setWeatherError(null);

      try {
        const isToday = date === formatLocalDate(new Date()) && new Date(date).getDate() === new Date().getDate() && new Date(date).getMonth() === new Date().getMonth() && new Date(date).getFullYear() === new Date().getFullYear();

        const url = isToday ? "/api/weather" : "/api/weather/weather-by-date";
        const body = isToday ? undefined : JSON.stringify({ date });

        const response = await fetch(url, {
          method: isToday ? "GET" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch weather data for ${date}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const station = data.find((s: WeatherData) => s.station_name === selectedStation) || data[0];
        setWeatherData(station);
      } catch (error) {
        console.error(`Error fetching weather data for ${date}:`, error);
        setWeatherError(error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil data cuaca");
      } finally {
        setIsWeatherLoading(false);
      }
    },
    [selectedStation]
  );

  const loadDataForMonth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const today = new Date();
      const todayStr = formatLocalDate(today);

      const realtimeData = await fetchRealtimePM25Data();

      const daysInMonth = getDaysInMonth(currentMonth, currentYear);
      const datesToFetch: string[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = formatLocalDate(date);

        if (dateStr === todayStr) {
          continue;
        }

        datesToFetch.push(dateStr);
      }

      let historicalData: PM25Data[] = [];
      if (datesToFetch.length > 0) {
        const responses = await Promise.all(datesToFetch.map((date) => fetchHistoricalPM25Data(date)));
        historicalData = responses.flat();
      }

      const combinedData = [...realtimeData, ...historicalData];
      setPM25Data(combinedData);
    } catch (err) {
      console.error("Error loading PM2.5 data:", err);
      setError("Gagal memuat data PM2.5. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, currentYear, selectedStation, fetchRealtimePM25Data, fetchHistoricalPM25Data]);

  useEffect(() => {
    loadDataForMonth();
  }, [currentMonth, currentYear, selectedStation, loadDataForMonth]);

  useEffect(() => {
    fetchWeatherData(formatLocalDate(selectedDate));
  }, [selectedDate, selectedStation, fetchWeatherData]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getPM25Value = (date: Date) => {
    if (!pm25Data.length) return null;

    const dateString = formatLocalDate(date);
    const stationData = pm25Data.find((item) => item.date === dateString && item.station_name === selectedStation);
    return stationData?.pm25_value ?? null;
  };

  const generateCalendarData = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfWeek = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, pm25: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const pm25 = getPM25Value(date);
      days.push({ day, pm25 });
    }

    return days;
  };

  const stationNames = pm25Data
    .map((item) => item?.station_name)
    .filter((name): name is string => !!name)
    .filter((name, index, self) => self.indexOf(name) === index);

  const calendarDays = generateCalendarData();
  const today = new Date();
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const selectedPMValue = getPM25Value(selectedDate);

  const renderQualityBox = () => {
    if (isLoading) {
      return (
        <div className={styles.qualityBox}>
          <div className="flex items-center justify-center gap-4">
            <div className={styles.spinner}></div>
            <span>Memuat data PM2.5...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.qualityBox}>
          <div className={styles.error}>{error}</div>
        </div>
      );
    }

    return (
      <div className={styles.qualityBox}>
        <div className={styles.qualityBoxIndicator}>
          <Image src={getPMImage(selectedPMValue)} alt="indikator kualitas udara" width={70} height={70} />
          <div>
            <p style={{ fontSize: "25px", fontWeight: "bolder" }}>{selectedPMValue !== null ? selectedPMValue.toFixed(1) : "N/A"}</p>
            <p style={{ fontSize: "15px" }}>µg/m³</p>
          </div>
        </div>
        <p>Kategori</p>
        <strong>
          {selectedPMValue === null ? "DATA TIDAK TERSEDIA" : selectedPMValue <= 50 ? "BAIK" : selectedPMValue <= 100 ? "SEDANG" : selectedPMValue <= 199 ? "TIDAK SEHAT" : selectedPMValue <= 299 ? "SANGAT TIDAK SEHAT" : "BERBAHAYA"}
        </strong>
      </div>
    );
  };

  const renderLegend = () => (
    <div className={styles.legend}>
      <h3>Keterangan (µg/m³)</h3>
      {[
        {
          range: "0-50",
          color: "#00CC00",
          label: "Baik",
          desc: "Tingkat kualitas udara yang tidak memberikan efek bagi kesehatan manusia atau hewan dan tidak berpengaruh pada tumbuhan, bangunan ataupun nilai estetika",
        },
        {
          range: "51-100",
          color: "#0133FF",
          label: "Sedang",
          desc: "Tingkat kualitas udara yang tidak berpengaruh pada kesehatan manusia ataupun hewan tetapi berpengaruh pada tumbuhan yang sensitif, dan nilai estetika",
        },
        {
          range: "101-199",
          color: "#FFC900",
          label: "Tidak Sehat",
          desc: "Tingkat kualitas udara yang bersifat merugikan pada manusia ataupun kelompok hewan yang sensitif atau bisa menimbulkan kerusakan pada tumbuhan ataupun nilai estetika",
        },
        {
          range: "200-299",
          color: "#FF0000",
          label: "Sangat Tidak Sehat",
          desc: "Tingkat kualitas udara yang dapat merugikan kesehatan pada sejumlah segmen populasi yang terpapar",
        },
        {
          range: "300-500",
          color: "#222222",
          label: "Berbahaya",
          desc: "Tingkat kualitas udara berbahaya yang secara umum dapat merugikan kesehatan yang serius pada populasi",
        },
      ].map((item, index) => (
        <div key={index} className={styles.legendItem}>
          <div className={styles.legendHeader}>
            <span>{item.range}</span>
            <span style={{ backgroundColor: item.color }}>{item.label}</span>
          </div>
          <p>{item.desc}</p>
        </div>
      ))}
    </div>
  );

  const renderWeatherTable = () => (
    <div className={styles.weather}>
      <div className={styles.weatherHeader}>
        <h3>Data Cuaca {selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear() ? "Hari Ini" : formatDate(selectedDate)}</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>Suhu (°C)</th>
            <th>Curah hujan (mm)</th>
            <th>Kelembaban (%)</th>
            <th>Arah angin (°)</th>
            <th>Kec. angin (m/s)</th>
          </tr>
        </thead>
        <tbody>
          {isWeatherLoading ? (
            <tr>
              <td colSpan={5} className={styles.loadingRow}>
                <div className="flex items-center justify-center gap-4">
                  <div className={styles.spinner}></div>
                  <span>Memuat data cuaca...</span>
                </div>
              </td>
            </tr>
          ) : weatherError ? (
            <tr>
              <td colSpan={5} className={styles.errorRow}>
                {weatherError}
                <button onClick={() => fetchWeatherData(formatLocalDate(selectedDate))} className={styles.retryButton}>
                  Coba Lagi
                </button>
              </td>
            </tr>
          ) : weatherData ? (
            <tr>
              <td>{weatherData.temperature.toFixed(1)}</td>
              <td>{weatherData.precipitation.toFixed(1)}</td>
              <td>{weatherData.humidity.toFixed(1)}</td>
              <td>{weatherData.wind_dir.toFixed(1)}</td>
              <td>{weatherData.wind_speed.toFixed(1)}</td>
            </tr>
          ) : (
            <tr>
              <td colSpan={5}>Data cuaca tidak tersedia</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={`${styles.container} ${isSplitView ? styles.isSplitView : ""} ${splitViewContainer || ""}`}>
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.location}>
            <div className={styles.locationIcon}>📍</div>
            <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} className={styles.stationSelector} disabled={isLoading}>
              {stationNames.map((name) => (
                <option key={name} value={name}>
                  {formatStationName(name)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.date}>
            📅 {selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear() ? "Hari ini" : "Tanggal terpilih"}: {formatDate(selectedDate)}
          </div>
          <p>Data PM2.5 (µg/m³)</p>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className={styles.monthYearSelector}>
                <select value={currentMonth} onChange={(e) => setCurrentMonth(parseInt(e.target.value))} className={styles.monthSelector}>
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>

                <select value={currentYear} onChange={(e) => setCurrentYear(parseInt(e.target.value))} className={styles.yearSelector}>
                  {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {isLoading ? (
              <div className="text-center py-8 flex items-center justify-center gap-4">
                <div className={styles.spinner}></div>
                <span>Memuat data PM2.5...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <div className={styles.calendarGrid}>
                {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day) => (
                  <div key={day} className={styles.dayName}>
                    {day.substring(0, 3)}
                  </div>
                ))}
                {calendarDays.map((dayData, index) => (
                  <div
                    key={index}
                    className={`${styles.dayCell} ${dayData.day ? "" : styles.otherMonthDay} ${isCurrentMonth && dayData.day === today.getDate() ? styles.today : ""} ${
                      dayData.day && selectedDate.getDate() === dayData.day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear ? styles.selectedDate : ""
                    }`}
                    onClick={() => dayData.day && handleDateClick(dayData.day)}
                    style={{ cursor: dayData.day ? "pointer" : "default" }}
                  >
                    {dayData.day && (
                      <>
                        <div className={styles.dateNumber}>{dayData.day}</div>
                        <div className={styles.indikatorPMContainer}>
                          <div
                            className={styles.indikatorPM}
                            style={{
                              backgroundColor: getPMColor(dayData.pm25),
                            }}
                          >
                            <span className={styles.pmValue}>{dayData.pm25 !== null ? Math.round(dayData.pm25) : "-"}</span>
                          </div>
                          <div className={styles.dataLabel}>{dayData.pm25 !== null ? "Aktual" : "No Data"}</div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showRightPanel && (
          <div className={styles.right}>
            <div className={styles.infromationPM}>
              {renderQualityBox()}
              <div className={styles.activityRec}>
                <b>Kegiatan yang direkomendasikan</b>
                <p>{getActivityRecommendation(selectedPMValue)}</p>
              </div>
            </div>
            {renderLegend()}
            {renderWeatherTable()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
