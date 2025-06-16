// "use client";

// import dynamic from "next/dynamic";

// const Map = dynamic(() => import("./SplitViewJakartaMap"), {
//   ssr: false,
//   loading: () => <div>Memuat peta...</div>,
// });

// export default function MapWrapper() {
//   return <Map />;
// }

"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./page"), {
  ssr: false,
  loading: () => <div>Memuat peta...</div>,
});

export default function MapWrapper() {
  return <Map />;
}
