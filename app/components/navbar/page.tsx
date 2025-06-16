// "use client";
// import React from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import styles from "./navbar.module.css";

// const Navbar = () => {
//   const pathname = usePathname();

//   return (

//     <div className={styles.navbar}>
//       <div className={styles.left}>PM2.5</div>
//       <div className={styles.center}>
//         <Link href="/" className={`${styles.navLink} ${pathname === "/" ? styles.active : ""}`}>
//           AOD
//         </Link>
//         <Link href="/calendar" className={`${styles.navLink} ${pathname === "/calendar" ? styles.active : ""}`}>
//           Calendar
//         </Link>
//         <Link href="/stasiun-map" className={`${styles.navLink} ${pathname === "/stasiun-map" ? styles.active : ""}`}>
//           PM25 (VIIRS)
//         </Link>
//         <Link href="/pm25-stasiun" className={`${styles.navLink} ${pathname === "/pm25-stasiun" ? styles.active : ""}`}>
//           PM25 (Stasiun)
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default Navbar;

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
              <Link href="/stasiun-map" className={`${styles.dropdownItem} ${pathname === "/stasiun-map" ? styles.active : ""}`} onClick={closeDropdown}>
                PM25 (Satelit)
              </Link>
              <Link href="/pm25-stasiun" className={`${styles.dropdownItem} ${pathname === "/pm25-stasiun" ? styles.active : ""}`} onClick={closeDropdown}>
                PM25 (Stasiun)
              </Link>
            </div>
          )}
        </div>

        <Link href="/calendar" className={`${styles.navLink} ${pathname === "/calendar" ? styles.active : ""}`}>
          Calendar
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
