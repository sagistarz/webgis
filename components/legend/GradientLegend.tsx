import React from "react";
import styles from "@/styles/heatmap.module.css";

interface GradientLegendProps {
  dataType: "aod" | "pm25-est";
}

const GradientLegend: React.FC<GradientLegendProps> = ({ dataType }) => {
  const aodColors = [
    "rgba(128, 0, 128, 0.85)", // Ungu (<0)
    "rgba(0, 0, 255, 0.85)", // Biru
    "rgba(0, 128, 0, 0.85)", // Hijau
    "rgba(255, 255, 0, 0.85)", // Kuning
    "rgba(255, 165, 0, 0.85)", // Jingga
    "rgba(255, 0, 0, 0.85)", // Merah (>4)
  ];

  const pm25Colors = [
    "rgba(0, 204, 0, 0.85)", // Hijau (0-50)
    "rgba(1, 51, 255, 0.85)", // Biru (51-100)
    "rgba(255, 201, 0, 0.85)", // Kuning (101-199)
    "rgba(255, 0, 0, 0.85)", // Merah (200-299)
    "rgba(34, 34, 34, 0.85)", // Hitam (>300)
  ];

  const gradient = dataType === "aod" ? `linear-gradient(to right, ${aodColors.join(", ")})` : `linear-gradient(to right, ${pm25Colors.join(", ")})`;

  return (
    <div className={styles.gradientLegend}>
      <div className={styles.gradientBar} style={{ background: gradient }} />
      <div className={styles.gradientLabels}>
        {dataType === "aod" ? (
          <>
            <span>0 (Rendah)</span>
            <span>4.0 (Tinggi)</span>
          </>
        ) : (
          <>
            <span>0</span>
            <span>300+</span>
          </>
        )}
      </div>
      <div className={styles.legendLabels}>
        {dataType === "aod" ? (
          <></>
        ) : (
          <>
            <div className={styles.legendItem}>
              <span>Baik (0 - 50)</span>
            </div>
            <div className={styles.legendItem}>
              <span>Sedang (51 - 100)</span>
            </div>
            <div className={styles.legendItem}>
              <span>Tidak Sehat (101 - 199)</span>
            </div>
            <div className={styles.legendItem}>
              <span>Sangat Tidak Sehat (200 - 299)</span>
            </div>
            <div className={styles.legendItem}>
              <span>Berbahaya (&gt;300)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GradientLegend;
