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

  // Render the chart when renderChart changes or on mount
  useEffect(() => {
    if (chartRef.current) {
      // Clear any existing chart
      chartRef.current.innerHTML = "";

      // Render the new chart
      renderChart(chartRef.current);
    }
  }, [renderChart]);

  // Set up global event listener for chart item clicks
  useEffect(() => {
    const handleChartClick = (e: Event) => {
      const customEvent = e as CustomEvent;
      setModalData(customEvent.detail);
      setIsModalOpen(true);
    };

    window.addEventListener("chartItemClick", handleChartClick);
    return () => window.removeEventListener("chartItemClick", handleChartClick);
  }, []);

  return (
    <div className="w-full  border-amber-100">
      <h2 className="text-center text-white text-2xl mb-10">{title}</h2>

      {/* Chart container with defined height */}
      <div
        ref={chartRef}
        className="w-full h-[500px] border-amber-50 text-white shadow rounded"
      ></div>

      {/* Modal for chart item details */}
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
