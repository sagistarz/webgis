"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";

const Navbar = () => {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.left}>PM2.5</div>

      <div className={styles.center}>
        <div className={styles.dropdown}>
          <button onClick={toggleDropdown} className={styles.navLink}>
            PETA ▾
          </button>
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <Link href="/" className={`${styles.dropdownItem} ${pathname === "/" ? styles.active : ""}`} onClick={closeDropdown}>
                AOD
              </Link>
              <Link href="/pm25-estimasi" className={`${styles.dropdownItem} ${pathname === "/pm25-estimasi" ? styles.active : ""}`} onClick={closeDropdown}>
                PM25 (Estimasi)
              </Link>
              <Link href="/pm25-aktual" className={`${styles.dropdownItem} ${pathname === "/pm25-aktual" ? styles.active : ""}`} onClick={closeDropdown}>
                PM25 (Aktual)
              </Link>
            </div>
          )}
        </div>

        <Link href="/calendar" className={`${styles.navLink} ${pathname === "/calendar" ? styles.active : ""}`}>
          Kalender
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
