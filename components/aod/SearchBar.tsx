"use client";

import React, { useRef, useState, useEffect } from "react";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import * as L from "leaflet";
import styles from "@/styles/searchbar.module.css";

interface GeoSearchResult {
  x: number; // long
  y: number; // lat
  label: string;
  bounds: [number, number][] | null;
}

interface SearchResult {
  x: number; // long
  y: number; // lat
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

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
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setError(null);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (query.length > 2 && typeof window !== "undefined") {
      debounceTimeout.current = setTimeout(async () => {
        try {
          const provider = new OpenStreetMapProvider();
          const results: GeoSearchResult[] = await provider.search({ query: `${query}, Jakarta, Indonesia` });
          if (results.length === 0) {
            setError("Tidak ada hasil ditemukan");
            setSearchResults([]);
            return;
          }
          const formattedResults: SearchResult[] = results.slice(0, 5).map((result: GeoSearchResult) => ({
            x: result.x,
            y: result.y,
            label: result.label,
            bounds: result.bounds
              ? L.latLngBounds([
                  [result.bounds[0][0], result.bounds[0][1]],
                  [result.bounds[1][0], result.bounds[1][1]],
                ])
              : null,
          }));
          setSearchResults(formattedResults);
        } catch (error) {
          console.error("Search error:", error);
          setError("Gagal melakukan pencarian");
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
    setError(null);
    if (mapRef.current) {
      const latlng = L.latLng(result.y, result.x);
      updateMarker(latlng);
      mapRef.current.setView([result.y, result.x], 15);
    }
  };

  return (
    <div className={styles.searchBarContainer}>
      <label htmlFor="searchInput" className={styles.searchLabel}>
        Cari Lokasi
      </label>
      <div className={styles.searchInputContainer}>
        <input
          type="text"
          id="searchInput"
          placeholder="Cari lokasi di Jakarta..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
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
          className={styles.searchButton}
          onClick={() => {
            if (searchQuery && typeof window !== "undefined") {
              const provider = new OpenStreetMapProvider();
              provider
                .search({ query: `${searchQuery}, Jakarta, Indonesia` })
                .then((results: GeoSearchResult[]) => {
                  if (results.length > 0) {
                    const formattedResult: SearchResult = {
                      x: results[0].x,
                      y: results[0].y,
                      label: results[0].label,
                      bounds: results[0].bounds
                        ? L.latLngBounds([
                            [results[0].bounds[0][0], results[0].bounds[0][1]],
                            [results[0].bounds[1][0], results[0].bounds[1][1]],
                          ])
                        : null,
                    };
                    handleSearchSelect(formattedResult);
                  } else {
                    setError("Tidak ada hasil ditemukan");
                  }
                })
                .catch((err) => {
                  console.error("Search error:", err);
                  setError("Gagal melakukan pencarian");
                });
            }
          }}
        >
          Cari
        </button>
      </div>
      {error && <div className={styles.searchError}>{error}</div>}
      {searchResults.length > 0 && (
        <div className={styles.searchResults}>
          {searchResults.map((result, index) => (
            <div key={index} className={styles.searchResultItem} onClick={() => handleSearchSelect(result)}>
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
