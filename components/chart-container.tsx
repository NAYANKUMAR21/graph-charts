"use client";

import { useEffect, useRef, useState } from "react";
import ChartModal from "./chart-modal";

interface ChartContainerProps {
  title: string;
  chartType: string;
  renderChart: (container: HTMLDivElement) => void;
}

export default function ChartContainer({
  title,
  chartType,
  renderChart,
}: ChartContainerProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Clear any existing chart
      chartRef.current.innerHTML = "";

      // Render the new chart
      renderChart(chartRef.current);

      // Set up global event listener for chart item clicks
      window.addEventListener("chartItemClick", ((e: CustomEvent) => {
        setModalData(e.detail);
        setIsModalOpen(true);
      }) as EventListener);

      return () => {
        window.removeEventListener("chartItemClick", ((e: CustomEvent) => {
          setModalData(e.detail);
          setIsModalOpen(true);
        }) as EventListener);
      };
    }
  }, [renderChart]);

  return (
    <div className="graph-container">
      <h2 className="chart-title">{title}</h2>
      <div ref={chartRef} style={{ width: "100%", height: "100%" }}></div>

      <ChartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={modalData}
        title={`${title} Details`}
        chartType={chartType}
      />
    </div>
  );
}
