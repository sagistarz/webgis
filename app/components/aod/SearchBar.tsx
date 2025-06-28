// // // // "use client";
// // // // import React, { useRef, useState, useEffect } from "react";
// // // // import { OpenStreetMapProvider } from "leaflet-geosearch";
// // // // import styles from "./map.module.css";
// // // // import L from "leaflet";

// // // // interface SearchBarProps {
// // // //   updateMarker: (latlng: L.LatLng) => void;
// // // //   mapRef: React.MutableRefObject<L.Map | null>;
// // // // }

// // // // const SearchBar = React.memo(({ updateMarker, mapRef }: SearchBarProps) => {
// // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // //   const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
// // // //   const [searchQuery, setSearchQuery] = useState<string>("");
// // // //   const [searchResults, setSearchResults] = useState<any[]>([]);

// // // //   useEffect(() => {
// // // //     const input = inputRef.current;
// // // //     if (input) {
// // // //       const handleBlur = () => {
// // // //         setTimeout(() => setSearchResults([]), 200);
// // // //       };
// // // //       input.addEventListener("blur", handleBlur);
// // // //       return () => {
// // // //         input.removeEventListener("blur", handleBlur);
// // // //       };
// // // //     }
// // // //     return () => {};
// // // //   }, []);

// // // //   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// // // //     const query = e.target.value;
// // // //     setSearchQuery(query);

// // // //     if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

// // // //     if (query.length > 2) {
// // // //       debounceTimeout.current = setTimeout(async () => {
// // // //         try {
// // // //           const provider = new OpenStreetMapProvider();
// // // //           const results = await provider.search({ query: `${query}, Jakarta, Indonesia` });
// // // //           setSearchResults(results.slice(0, 5));
// // // //         } catch (error) {}
// // // //       }, 500);
// // // //     } else {
// // // //       setSearchResults([]);
// // // //     }
// // // //   };

// // // //   const handleSearchSelect = (result: any) => {
// // // //     setSearchQuery(result.label);
// // // //     setSearchResults([]);
// // // //     if (mapRef.current) {
// // // //       const { x: lng, y: lat } = result;
// // // //       updateMarker(L.latLng(lat, lng));
// // // //       mapRef.current.setView([lat, lng], 15);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <div className="relative w-80">
// // // //       <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-md">
// // // //         <input
// // // //           key="search-input"
// // // //           type="text"
// // // //           placeholder="Cari lokasi di Jakarta..."
// // // //           value={searchQuery}
// // // //           onChange={handleSearchChange}
// // // //           className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
// // // //           ref={inputRef}
// // // //           onKeyDown={(e) => {
// // // //             e.stopPropagation();
// // // //             if (searchResults.length > 0 && e.key === "Enter") {
// // // //               e.preventDefault();
// // // //               handleSearchSelect(searchResults[0]);
// // // //             }
// // // //           }}
// // // //         />
// // // //         <button
// // // //           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
// // // //           onClick={() => {
// // // //             if (searchQuery) {
// // // //               const provider = new OpenStreetMapProvider();
// // // //               provider.search({ query: `${searchQuery}, Jakarta, Indonesia` }).then((results) => {
// // // //                 if (results.length > 0) {
// // // //                   handleSearchSelect(results[0]);
// // // //                 }
// // // //               });
// // // //             }
// // // //           }}
// // // //         >
// // // //           Cari
// // // //         </button>
// // // //       </div>
// // // //       {searchResults.length > 0 && (
// // // //         <div className="absolute top-full left-0 w-full bg-white rounded-lg shadow-lg mt-1 z-[1000] max-h-60 overflow-y-auto">
// // // //           {searchResults.map((result, index) => (
// // // //             <div
// // // //               key={index}
// // // //               className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
// // // //               onClick={() => {
// // // //                 handleSearchSelect(result);
// // // //               }}
// // // //             >
// // // //               {result.label}
// // // //             </div>
// // // //           ))}
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // });

// // // // export default SearchBar;

// // // "use client";
// // // import React, { useRef, useState, useEffect } from "react";
// // // import { OpenStreetMapProvider } from "leaflet-geosearch";
// // // import L from "leaflet";

// // // interface SearchResult {
// // //   x: number; // Longitude
// // //   y: number; // Latitude
// // //   label: string;
// // //   bounds: L.LatLngBounds;
// // // }

// // // interface SearchBarProps {
// // //   updateMarker: (latlng: L.LatLng) => void;
// // //   mapRef: React.MutableRefObject<L.Map | null>;
// // // }

// // // const SearchBar: React.FC<SearchBarProps> = ({ updateMarker, mapRef }) => {
// // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // //   const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
// // //   const [searchQuery, setSearchQuery] = useState<string>("");
// // //   const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

// // //   useEffect(() => {
// // //     const input = inputRef.current;
// // //     if (input) {
// // //       const handleBlur = () => {
// // //         setTimeout(() => setSearchResults([]), 200);
// // //       };
// // //       input.addEventListener("blur", handleBlur);
// // //       return () => {
// // //         input.removeEventListener("blur", handleBlur);
// // //       };
// // //     }
// // //     return () => {};
// // //   }, []);

// // //   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// // //     const query = e.target.value;
// // //     setSearchQuery(query);

// // //     if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

// // //     if (query.length > 2) {
// // //       debounceTimeout.current = setTimeout(async () => {
// // //         try {
// // //           const provider = new OpenStreetMapProvider();
// // //           const results = await provider.search({ query: `${query}, Jakarta, Indonesia` });
// // //           setSearchResults(results.slice(0, 5) as SearchResult[]);
// // //         } catch {
// // //           // Optionally handle the error (e.g., log or display a message)
// // //           // For now, silently ignore as per original code
// // //         }
// // //       }, 500);
// // //     } else {
// // //       setSearchResults([]);
// // //     }
// // //   };

// // //   const handleSearchSelect = (result: SearchResult) => {
// // //     setSearchQuery(result.label);
// // //     setSearchResults([]);
// // //     if (mapRef.current) {
// // //       const { x: lng, y: lat } = result;
// // //       updateMarker(L.latLng(lat, lng));
// // //       mapRef.current.setView([lat, lng], 15);
// // //     }
// // //   };

// // //   return (
// // //     <div className="relative w-80">
// // //       <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-md">
// // //         <input
// // //           key="search-input"
// // //           type="text"
// // //           placeholder="Cari lokasi di Jakarta..."
// // //           value={searchQuery}
// // //           onChange={handleSearchChange}
// // //           className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //           ref={inputRef}
// // //           onKeyDown={(e) => {
// // //             e.stopPropagation();
// // //             if (searchResults.length > 0 && e.key === "Enter") {
// // //               e.preventDefault();
// // //               handleSearchSelect(searchResults[0]);
// // //             }
// // //           }}
// // //         />
// // //         <button
// // //           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
// // //           onClick={() => {
// // //             if (searchQuery) {
// // //               const provider = new OpenStreetMapProvider();
// // //               provider.search({ query: `${searchQuery}, Jakarta, Indonesia` }).then((results) => {
// // //                 if (results.length > 0) {
// // //                   handleSearchSelect(results[0] as SearchResult);
// // //                 }
// // //               });
// // //             }
// // //           }}
// // //         >
// // //           Cari
// // //         </button>
// // //       </div>
// // //       {searchResults.length > 0 && (
// // //         <div className="absolute top-full left-0 w-full bg-white rounded-lg shadow-lg mt-1 z-[1000] max-h-60 overflow-y-auto">
// // //           {searchResults.map((result, index) => (
// // //             <div
// // //               key={index}
// // //               className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
// // //               onClick={() => {
// // //                 handleSearchSelect(result);
// // //               }}
// // //             >
// // //               {result.label}
// // //             </div>
// // //           ))}
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // SearchBar.displayName = "SearchBar";

// // // export default React.memo(SearchBar);

// // "use client";
// // import React, { useRef, useState, useEffect } from "react";
// // import { OpenStreetMapProvider } from "leaflet-geosearch";
// // import L from "leaflet";

// // interface SearchResult {
// //   x: number; // Longitude
// //   y: number; // Latitude
// //   label: string;
// //   bounds: L.LatLngBounds;
// // }

// // interface SearchBarProps {
// //   updateMarker: (latlng: L.LatLng) => void;
// //   mapRef: React.MutableRefObject<L.Map | null>;
// // }

// // const SearchBar: React.FC<SearchBarProps> = ({ updateMarker, mapRef }) => {
// //   const inputRef = useRef<HTMLInputElement | null>(null);
// //   const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
// //   const [searchQuery, setSearchQuery] = useState<string>("");
// //   const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

// //   useEffect(() => {
// //     const input = inputRef.current;
// //     if (input) {
// //       const handleBlur = () => {
// //         setTimeout(() => setSearchResults([]), 200);
// //       };
// //       input.addEventListener("blur", handleBlur);
// //       return () => {
// //         input.removeEventListener("blur", handleBlur);
// //       };
// //     }
// //     return () => {};
// //   }, []);

// //   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const query = e.target.value;
// //     setSearchQuery(query);

// //     if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

// //     if (query.length > 2) {
// //       debounceTimeout.current = setTimeout(async () => {
// //         try {
// //           const provider = new OpenStreetMapProvider();
// //           const results = await provider.search({ query: `${query}, Jakarta, Indonesia` });
// //           setSearchResults(results.slice(0, 5) as SearchResult[]);
// //         } catch {
// //           // Optionally handle the error (e.g., log or display a message)
// //         }
// //       }, 500);
// //     } else {
// //       setSearchResults([]);
// //     }
// //   };

// //   const handleSearchSelect = (result: SearchResult) => {
// //     setSearchQuery(result.label);
// //     setSearchResults([]);
// //     if (mapRef.current) {
// //       const { x: lng, y: lat } = result;
// //       updateMarker(L.latLng(lat, lng));
// //       mapRef.current.setView([lat, lng], 15);
// //     }
// //   };

// //   return (
// //     <div className="relative w-80">
// //       <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-md">
// //         <input
// //           key="search-input"
// //           type="text"
// //           placeholder="Cari lokasi di Jakarta..."
// //           value={searchQuery}
// //           onChange={handleSearchChange}
// //           className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           ref={inputRef}
// //           onKeyDown={(e) => {
// //             e.stopPropagation();
// //             if (searchResults.length > 0 && e.key === "Enter") {
// //               e.preventDefault();
// //               handleSearchSelect(searchResults[0]);
// //             }
// //           }}
// //         />
// //         <button
// //           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
// //           onClick={() => {
// //             if (searchQuery) {
// //               const provider = new OpenStreetMapProvider();
// //               provider.search({ query: `${searchQuery}, Jakarta, Indonesia` }).then((results) => {
// //                 if (results.length > 0) {
// //                   handleSearchSelect(results[0] as SearchResult);
// //                 }
// //               });
// //             }
// //           }}
// //         >
// //           Cari
// //         </button>
// //       </div>
// //       {searchResults.length > 0 && (
// //         <div className="absolute top-full left-0 w-full bg-white rounded-lg shadow-lg mt-1 z-[1000] max-h-60 overflow-y-auto">
// //           {searchResults.map((result, index) => (
// //             <div
// //               key={index}
// //               className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
// //               onClick={() => {
// //                 handleSearchSelect(result);
// //               }}
// //             >
// //               {result.label}
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // SearchBar.displayName = "SearchBar";

// // export default React.memo(SearchBar);

// "use client";

// import React, { useRef, useState, useEffect } from "react";
// import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
// import L from "leaflet";
// import styles from "./map.module.css"; // Pastikan file CSS ini ada

// interface SearchResult {
//   x: number; // Longitude
//   y: number; // Latitude
//   label: string;
//   bounds: L.LatLngBounds | null; // Ubah ke L.LatLngBounds | null
// }

// interface SearchBarProps {
//   updateMarker: (latlng: L.LatLng) => void;
//   mapRef: React.MutableRefObject<L.Map | null>;
// }

// const SearchBar: React.FC<SearchBarProps> = ({ updateMarker, mapRef }) => {
//   const inputRef = useRef<HTMLInputElement>(null); // Hapus | null karena menggunakan null!
//   const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

//   useEffect(() => {
//     const input = inputRef.current;
//     if (input) {
//       const handleBlur = () => {
//         setTimeout(() => setSearchResults([]), 200);
//       };
//       input.addEventListener("blur", handleBlur);
//       return () => {
//         input.removeEventListener("blur", handleBlur);
//       };
//     }
//     return () => {};
//   }, []);

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

//     if (query.length > 2) {
//       debounceTimeout.current = setTimeout(async () => {
//         try {
//           const provider = new OpenStreetMapProvider();
//           const results = await provider.search({ query: `${query}, Jakarta, Indonesia` });
//           // Konversi hasil pencarian ke tipe SearchResult
//           const formattedResults: SearchResult[] = results.slice(0, 5).map((result) => ({
//             x: result.x,
//             y: result.y,
//             label: result.label,
//             bounds: result.bounds
//               ? L.latLngBounds(
//                   [result.bounds[0][0], result.bounds[0][1]], // [lat, lng] kiri bawah
//                   [result.bounds[1][0], result.bounds[1][1]] // [lat, lng] kanan atas
//                 )
//               : null,
//           }));
//           setSearchResults(formattedResults);
//         } catch (error) {
//           console.error("Search error:", error);
//           setSearchResults([]);
//         }
//       }, 500);
//     } else {
//       setSearchResults([]);
//     }
//   };

//   const handleSearchSelect = (result: SearchResult) => {
//     setSearchQuery(result.label);
//     setSearchResults([]);
//     if (mapRef.current) {
//       const { x: lng, y: lat } = result;
//       updateMarker(L.latLng(lat, lng));
//       mapRef.current.setView([lat, lng], 15);
//     }
//   };

//   return (
//     <div className="relative w-80">
//       <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-md">
//         <input
//           key="search-input"
//           type="text"
//           placeholder="Cari lokasi di Jakarta..."
//           value={searchQuery}
//           onChange={handleSearchChange}
//           className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
//           ref={inputRef}
//           onKeyDown={(e) => {
//             e.stopPropagation();
//             if (searchResults.length > 0 && e.key === "Enter") {
//               e.preventDefault();
//               handleSearchSelect(searchResults[0]);
//             }
//           }}
//         />
//         <button
//           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
//           onClick={() => {
//             if (searchQuery) {
//               const provider = new OpenStreetMapProvider();
//               provider.search({ query: `${searchQuery}, Jakarta, Indonesia` }).then((results) => {
//                 if (results.length > 0) {
//                   const formattedResult: SearchResult = {
//                     x: results[0].x,
//                     y: results[0].y,
//                     label: results[0].label,
//                     bounds: results[0].bounds ? L.latLngBounds([results[0].bounds[0][0], results[0].bounds[0][1]], [results[0].bounds[1][0], results[0].bounds[1][1]]) : null,
//                   };
//                   handleSearchSelect(formattedResult);
//                 }
//               });
//             }
//           }}
//         >
//           Cari
//         </button>
//       </div>
//       {searchResults.length > 0 && (
//         <div className="absolute top-full left-0 w-full bg-white rounded-lg shadow-lg mt-1 z-[1000] max-h-60 overflow-y-auto">
//           {searchResults.map((result, index) => (
//             <div
//               key={index}
//               className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
//               onClick={() => {
//                 handleSearchSelect(result);
//               }}
//             >
//               {result.label}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// SearchBar.displayName = "SearchBar";

// export default React.memo(SearchBar);

"use client";

import React, { useRef, useState, useEffect } from "react";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import L from "leaflet";

interface SearchResult {
  x: number; // Longitude
  y: number; // Latitude
  label: string;
  bounds: L.LatLngBounds | null;
}

interface SearchBarProps {
  updateMarker: (latlng: L.LatLng) => void;
  mapRef: React.MutableRefObject<L.Map | null>;
}

const SearchBar: React.FC<SearchBarProps> = ({ updateMarker, mapRef }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      const handleBlur = () => {
        setTimeout(() => setSearchResults([]), 200);
      };
      input.addEventListener("blur", handleBlur);
      return () => {
        input.removeEventListener("blur", handleBlur);
      };
    }
    return () => {};
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (query.length > 2) {
      debounceTimeout.current = setTimeout(async () => {
        try {
          const provider = new OpenStreetMapProvider();
          const results = await provider.search({ query: `${query}, Jakarta, Indonesia` });
          const formattedResults: SearchResult[] = results.slice(0, 5).map((result) => ({
            x: result.x,
            y: result.y,
            label: result.label,
            bounds: result.bounds ? L.latLngBounds([result.bounds[0][0], result.bounds[0][1]], [result.bounds[1][0], result.bounds[1][1]]) : null,
          }));
          setSearchResults(formattedResults);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    setSearchQuery(result.label);
    setSearchResults([]);
    if (mapRef.current) {
      const { x: lng, y: lat } = result;
      updateMarker(L.latLng(lat, lng));
      mapRef.current.setView([lat, lng], 15);
    }
  };

  return (
    <div className="relative w-80">
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-md">
        <input
          key="search-input"
          type="text"
          placeholder="Cari lokasi di Jakarta..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          ref={inputRef}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (searchResults.length > 0 && e.key === "Enter") {
              e.preventDefault();
              handleSearchSelect(searchResults[0]);
            }
          }}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => {
            if (searchQuery) {
              const provider = new OpenStreetMapProvider();
              provider.search({ query: `${searchQuery}, Jakarta, Indonesia` }).then((results) => {
                if (results.length > 0) {
                  const formattedResult: SearchResult = {
                    x: results[0].x,
                    y: results[0].y,
                    label: results[0].label,
                    bounds: results[0].bounds ? L.latLngBounds([results[0].bounds[0][0], results[0].bounds[0][1]], [results[0].bounds[1][0], results[0].bounds[1][1]]) : null,
                  };
                  handleSearchSelect(formattedResult);
                }
              });
            }
          }}
        >
          Cari
        </button>
      </div>
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white rounded-lg shadow-lg mt-1 z-[1000] max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
              onClick={() => {
                handleSearchSelect(result);
              }}
            >
              {result.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

SearchBar.displayName = "SearchBar";

export default React.memo(SearchBar);
