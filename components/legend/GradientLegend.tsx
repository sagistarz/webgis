// import React from 'react';
// import styles from '@/styles/heatmap.module.css';

// interface GradientLegendProps {
//   dataType: 'aod' | 'pm25-est';
// }

// const GradientLegend: React.FC<GradientLegendProps> = ({ dataType }) => {
//   return (
//     <div className={styles.gradientLegend}>
//       <div
//         className={styles.gradientBar}
//         style={{
//           background:
//             dataType === 'aod'
//               ? 'linear-gradient(to right, rgba(0, 255, 0, 0.7), rgba(255, 255, 0, 0.7), rgba(255, 0, 0, 0.7))'
//               : 'linear-gradient(to right, rgba(0, 204, 0, 0.7), rgba(1, 51, 255, 0.7), rgba(255, 201, 0, 0.7), rgba(255, 0, 0, 0.7), rgba(34, 34, 34, 0.7))',
//         }}
//       />
//       <div className={styles.gradientLabels}>
//         {dataType === 'aod' ? (
//           <>
//             <span>0 (Rendah)</span>
//             <span>0.3 (Tinggi)</span>
//           </>
//         ) : (
//           <>
//             <span>0</span>
//             <span>300+</span>
//           </>
//         )}
//       </div>
//       <div className={styles.legendLabels}>
//         {dataType === 'aod' ? (
//           <>
//             <div className={styles.legendItem}>
//               <span className={styles.legendColor} style={{ backgroundColor: 'rgba(0, 255, 0, 0.7)' }} />
//               <span>Rendah (0 - 0.1)</span>
//             </div>
//             <div className={styles.legendItem}>
//               <span className={styles.legendColor} style={{ backgroundColor: 'rgba(255, 255, 0, 0.7)' }} />
//               <span>Sedang (0.1 - 0.2)</span>
//             </div>
//             <div className={styles.legendItem}>
//               <span className={styles.legendColor} style={{ backgroundColor: 'rgba(255, 165, 0, 0.7)' }} />
//               <span>Tinggi (0.2 - 0.3)</span>
//             </div>
//             <div className={styles.legendItem}>
//               <span className={styles.legendColor} style={{ backgroundColor: 'rgba(255, 0, 0, 0.7)' }} />
//               <span>Sangat Tinggi ( 0.3)</span>
//             </div>
//           </>
//         ) : (
//           <>
//             <div className={styles.legendItem}>
//               <span className={styles.legendColor} style={{ backgroundColor: 'rgba(0, 204, 0, 0.7)' }} />
//               <span>Baik (0 - 50)</span>
//             </div>
//             <div className={styles.legendItem}>
//               <span className={styles.legendColor} style={{ backgroundColor: 'rgba(1, 51, 255, 0.7)' }} />
//               <span>Sedang (51 - 100)</span>
//             </div>
//             <div className={styles.legendItem}>
//               <span className={styles.legendColor} style={{ backgroundColor: 'rgba(255, 201, 0, 0.7)' }} />
//               <span>Tidak Sehat (101 - 199)</span>
//             </div>
//             <div className={styles.legendItem}>
//               <span className={styles.legendColor} style={{ backgroundColor: 'rgba(255, 0, 0, 0.7)' }} />
//               <span>Sangat Tidak Sehat (200 - 299)</span>
//             </div>
//             <div className={styles.legendItem}>
//               <span className={styles.legendColor} style={{ backgroundColor: 'rgba(34, 34, 34, 0.7)' }} />
//               <span>Berbahaya (&gt; 300)</span>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default GradientLegend;

import React from 'react';
import styles from '@/styles/heatmap.module.css';

interface GradientLegendProps {
  dataType: 'aod' | 'pm25-est';
}

const GradientLegend: React.FC<GradientLegendProps> = ({ dataType }) => {
  const aodColors = [
    'rgba(0, 255, 0, 0.85)', // Hijau (<0.3)
    'rgba(255, 255, 0, 0.85)', // Kuning (<0.5)
    'rgba(255, 165, 0, 0.85)', // Orange (<0.7)
    'rgba(255, 0, 0, 0.85)', // Merah (>1.0)
  ];

  const pm25Colors = [
    'rgba(0, 204, 0, 0.85)', // Hijau (0-50)
    'rgba(1, 51, 255, 0.85)', // Biru (51-100)
    'rgba(255, 201, 0, 0.85)', // Kuning (101-199)
    'rgba(255, 0, 0, 0.85)', // Merah (200-299)
    'rgba(34, 34, 34, 0.85)', // Hitam (>300)
  ];

  const gradient = dataType === 'aod' 
    ? `linear-gradient(to right, ${aodColors.join(', ')})`
    : `linear-gradient(to right, ${pm25Colors.join(', ')})`;

  return (
    <div className={styles.gradientLegend}>
      <div
        className={styles.gradientBar}
        style={{ background: gradient }}
      />
      <div className={styles.gradientLabels}>
        {dataType === 'aod' ? (
          <>
            <span>0 (Rendah)</span>
            <span>1.0+ (Tinggi)</span>
          </>
        ) : (
          <>
            <span>0</span>
            <span>300+</span>
          </>
        )}
      </div>
      <div className={styles.legendLabels}>
        {dataType === 'aod' ? (
          <>
          </>
        ) : (
          <>
            <div className={styles.legendItem}>
              {/* <span className={styles.legendColor} style={{ backgroundColor: 'rgba(0, 204, 0, 0.85)' }} /> */}
              <span>Baik (0 - 50)</span>
            </div>
            <div className={styles.legendItem}>
              {/* <span className={styles.legendColor} style={{ backgroundColor: 'rgba(1, 51, 255, 0.85)' }} /> */}
              <span>Sedang (51 - 100)</span>
            </div>
            <div className={styles.legendItem}>
              {/* <span className={styles.legendColor} style={{ backgroundColor: 'rgba(255, 201, 0, 0.85)' }} /> */}
              <span>Tidak Sehat (101 - 199)</span>
            </div>
            <div className={styles.legendItem}>
              {/* <span className={styles.legendColor} style={{ backgroundColor: 'rgba(255, 0, 0, 0.85)' }} /> */}
              <span>Sangat Tidak Sehat (200 - 299)</span>
            </div>
            <div className={styles.legendItem}>
              {/* <span className={styles.legendColor} style={{ backgroundColor: 'rgba(34, 34, 34, 0.85)' }} /> */}
              <span>Berbahaya (&gt;300)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GradientLegend;