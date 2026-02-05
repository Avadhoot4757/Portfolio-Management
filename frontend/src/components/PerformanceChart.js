import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const PerformanceChart = ({ history, investedSeries, investedLabel = "Invested" }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const context = canvasRef.current;
    if (!context) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const styles = getComputedStyle(document.documentElement);
    const hexToRgba = (hex, alpha) => {
      const cleaned = hex.replace("#", "");
      if (cleaned.length !== 6) return hex;
      const r = parseInt(cleaned.slice(0, 2), 16);
      const g = parseInt(cleaned.slice(2, 4), 16);
      const b = parseInt(cleaned.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const lineColor = styles.getPropertyValue("--primary").trim() || "#c5d6d4";
    const fillColor = lineColor.startsWith("#")
      ? hexToRgba(lineColor, 0.2)
      : lineColor;

    const datasets = [
      {
        label: "Value",
        data: history.map((item) => item.value),
        borderColor: lineColor,
        backgroundColor: fillColor,
        fill: true,
        tension: 0,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: lineColor
      }
    ];

    if (Array.isArray(investedSeries) && investedSeries.length > 0) {
      const investedColor = styles.getPropertyValue("--muted-strong").trim() || "#6b7280";
      datasets.push({
        label: investedLabel,
        data: investedSeries,
        borderColor: investedColor,
        backgroundColor: "transparent",
        fill: false,
        tension: 0,
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
        pointHoverRadius: 0
      });
    }

    chartRef.current = new Chart(context, {
      type: "line",
      data: {
        labels: history.map((item) => item.date),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: datasets.length > 1,
            labels: {
              color: styles.getPropertyValue("--muted-strong").trim() || "#6b7280"
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.04)",
              borderDash: [4, 6]
            },
            ticks: {
              color: styles.getPropertyValue("--muted-strong").trim() || "#6b7280"
            }
          },
          y: {
            grid: {
              color: "rgba(255, 255, 255, 0.06)",
              borderDash: [4, 6]
            },
            ticks: {
              color: styles.getPropertyValue("--muted-strong").trim() || "#6b7280",
              callback: (value) =>
                value.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0
                })
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
  }, [history, investedSeries, investedLabel]);

  return (
    <div className="chart-large">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PerformanceChart;
