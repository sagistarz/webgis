// "use client";

// import dynamic from "next/dynamic";
// import styles from "./map.module.css";

// const Map = dynamic(() => import("./page"), {
//   ssr: false,
//   loading: () => (
//     <div className={`${styles.mapContainer} flex items-center justify-center h-full bg-white`}>
//       <div className="flex flex-col items-center gap-4">
//         <div className={styles.spinner}></div>
//         <span className="text-lg font-medium text-gray-700">Memuat peta...</span>
//       </div>
//     </div>
//   ),
// });

// export default function MapWrapper() {
//   return <Map />;
// }

"use client";

import dynamic from "next/dynamic";
import styles from "./map.module.css";

const JakartaMap = dynamic(() => import("./page"), {
  ssr: false,
  loading: () => (
    <div className={`${styles.mapContainer} flex items-center justify-center h-full bg-white`}>
      <div className="flex flex-col items-center gap-4">
        <div className={styles.spinner}></div>
        <span className="text-lg font-medium text-gray-700">Memuat peta...</span>
      </div>
    </div>
  ),
});

export default function MapWrapper() {
  return <JakartaMap />;
}
