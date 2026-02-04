import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const FALLBACK_COLORS = ["#8b5cf6", "#f59e0b", "#f43f5e", "#6b7280"];

const AssetAllocationChart = ({ allocation, totalValue }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const context = canvasRef.current;
    if (!context) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const styles = getComputedStyle(document.documentElement);
    const getColor = (varName, fallback) =>
      styles.getPropertyValue(varName).trim() || fallback;

    const colors = [
      getColor("--primary", FALLBACK_COLORS[0]),
      getColor("--warning", FALLBACK_COLORS[1]),
      getColor("--negative", FALLBACK_COLORS[2]),
      getColor("--muted-strong", FALLBACK_COLORS[3])
    ];

    chartRef.current = new Chart(context, {
      type: "doughnut",
      data: {
        labels: allocation.labels,
        datasets: [
          {
            data: allocation.values,
            backgroundColor: colors,
            borderWidth: 0,
            hoverOffset: 6
          }
        ]
      },
      options: {
        cutout: "70%",
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = ctx.raw || 0;
                return `${ctx.label}: ${value.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0
                })}`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [allocation]);

  return (
    <div className="allocation">
      <div className="chart-wrap">
        <canvas ref={canvasRef} height="220" />
        <div className="chart-center">
          <div className="chart-center-inner">
            <span>Total Value</span>
            <strong>{totalValue}</strong>
          </div>
        </div>
      </div>
      <div className="legend">
        {allocation.labels.map((label, index) => (
          <div key={label} className="legend-item">
            <span className={`legend-swatch swatch-${index}`} />
            <span className="legend-text">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetAllocationChart;
