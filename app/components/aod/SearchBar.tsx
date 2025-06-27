"use client";
import React, { useRef, useState, useEffect } from "react";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import styles from "./map.module.css";
import L from "leaflet";

interface SearchBarProps {
  updateMarker: (latlng: L.LatLng) => void;
  mapRef: React.MutableRefObject<L.Map | null>;
}

const SearchBar = React.memo(({ updateMarker, mapRef }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

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
          setSearchResults(results.slice(0, 5));
        } catch (error) {}
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSelect = (result: any) => {
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
                  handleSearchSelect(results[0]);
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
});

export default SearchBar;
