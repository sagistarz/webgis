"use client";

import React, { useRef, useState, useEffect } from "react";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import * as L from "leaflet";
import styles from "@/styles/searchbar.module.css";
import { BoundaryGeoJSONData } from "@/app/types";
import * as turf from "@turf/turf";

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
  boundaryData: BoundaryGeoJSONData | null;
  resetMap: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ updateMarker, mapRef, boundaryData, resetMap }) => {
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

  const isPointInJakarta = (lat: number, lng: number): boolean => {
    if (!boundaryData || !boundaryData.features) return false;
    const point = turf.point([lng, lat]);
    return boundaryData.features.some((feature) => {
      try {
        return turf.booleanPointInPolygon(point, feature.geometry);
      } catch {
        return false;
      }
    });
  };

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
            setError("Tidak ada hasil yang ditemukan di Jakarta");
            setSearchResults([]);
            return;
          }
          const formattedResults: SearchResult[] = results
            .filter((result) => isPointInJakarta(result.y, result.x))
            .slice(0, 5)
            .map((result: GeoSearchResult) => ({
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
          if (formattedResults.length === 0) {
            setError("Tidak ada hasil yang ditemukan di wilayah Jakarta");
            setSearchResults([]);
            return;
          }
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

  const handleReset = () => {
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
    resetMap();
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
                  const validResults = results.filter((result) => isPointInJakarta(result.y, result.x));
                  if (validResults.length > 0) {
                    const formattedResult: SearchResult = {
                      x: validResults[0].x,
                      y: validResults[0].y,
                      label: validResults[0].label,
                      bounds: validResults[0].bounds
                        ? L.latLngBounds([
                            [validResults[0].bounds[0][0], validResults[0].bounds[0][1]],
                            [validResults[0].bounds[1][0], validResults[0].bounds[1][1]],
                          ])
                        : null,
                    };
                    handleSearchSelect(formattedResult);
                  } else {
                    setError("Lokasi tidak ada di wilayah Jakarta");
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
      <button
        className={`${styles.searchButton} mt-2`}
        onClick={handleReset}
      >
        Reset
      </button>
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