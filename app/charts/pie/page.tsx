"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChartContainer from "@/components/chart-container";
import {
  type InvoiceData,
  groupDataByField,
  calculateSum,
  getColorForIndex,
} from "@/utils/data-utils";

export default function PieChartPage() {
  const [data, setData] = useState<InvoiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem("invoiceData");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
    setIsLoading(false);
  }, []);

  const renderPieChart = (container: HTMLDivElement) => {
    if (!data.length) return;

    // Clear container first (important if re-rendering)
    container.innerHTML = "";

    const groupedData = groupDataByField(data, "customerType");
    const totalSales = calculateSum(data, "total");
    const chartData = Object.entries(groupedData)
      .map(([customerType, items], index) => {
        const sales = calculateSum(items, "total");
        return {
          customerType,
          sales,
          percentage: (sales / totalSales) * 100,
          color: getColorForIndex(index),
        };
      })
      .sort((a, b) => b.sales - a.sales);

    const chartSize =
      Math.min(container.clientWidth, container.clientHeight) - 60;
    const centerX = chartSize / 2 + 30;
    const centerY = chartSize / 2 + 30;
    const radius = chartSize / 2 - 20;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${chartSize + 60} ${chartSize + 60}`);
    container.appendChild(svg);

    let startAngle = 0;
    chartData.forEach((item) => {
      const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      const slice = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      slice.setAttribute("d", pathData);
      slice.setAttribute("fill", item.color);
      slice.style.transition = "transform 0.3s, stroke 0.3s";

      slice.addEventListener("mouseover", () => {
        const midAngle = startAngle + sliceAngle / 2;
        const pullDistance = 8;
        const translateX = pullDistance * Math.cos(midAngle);
        const translateY = pullDistance * Math.sin(midAngle);

        slice.setAttribute(
          "transform",
          `translate(${translateX}, ${translateY})`
        );
        slice.setAttribute("stroke", "white");
        slice.setAttribute("stroke-width", "2");
      });

      slice.addEventListener("mouseout", () => {
        slice.removeAttribute("transform");
        slice.setAttribute("stroke", "none");
      });

      svg.appendChild(slice);

      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.65;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);

      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.setAttribute("x", labelX.toString());
      label.setAttribute("y", labelY.toString());
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("alignment-baseline", "middle");
      label.setAttribute("fill", "white");
      label.setAttribute("font-size", "12");
      label.setAttribute("font-weight", "600");
      label.textContent = `${Math.round(item.percentage)}%`;
      svg.appendChild(label);

      startAngle = endAngle;
    });

    const legend = document.createElement("div");
    legend.style.marginTop = "20px";
    legend.style.display = "flex";
    legend.style.flexWrap = "wrap";
    legend.style.justifyContent = "center";
    legend.style.gap = "10px";

    chartData.forEach((item) => {
      const legendItem = document.createElement("div");
      legendItem.style.display = "flex";
      legendItem.style.alignItems = "center";
      legendItem.style.background = "#1f1f1f";
      legendItem.style.padding = "6px 10px";
      legendItem.style.borderRadius = "6px";

      const colorBox = document.createElement("div");
      colorBox.style.width = "12px";
      colorBox.style.height = "12px";
      colorBox.style.marginRight = "8px";
      colorBox.style.backgroundColor = item.color;
      colorBox.style.borderRadius = "2px";

      const label = document.createElement("span");
      label.style.color = "#ccc";
      label.style.fontSize = "13px";
      label.textContent = `${item.customerType}: $${item.sales.toFixed(2)}`;

      legendItem.appendChild(colorBox);
      legendItem.appendChild(label);
      legend.appendChild(legendItem);
    });

    container.appendChild(legend);
  };

  return (
    <div className="text-white">
      <div
        className="header"
        style={{ marginBottom: "2rem", textAlign: "center" }}
      >
        <h1 className="text-3xl font-bold mb-4">Pie Chart Visualization</h1>
        <Link
          href="/"
          className="nav-button"
          style={{
            background: "#3b82f6",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            color: "white",
          }}
        >
          Back to Dashboard
        </Link>
      </div>
      <div className="content">
        {isLoading ? (
          <div>Loading data...</div>
        ) : (
          <>
            <ChartContainer
              title="Sales Distribution by Customer Type"
              chartType="pie"
              renderChart={renderPieChart}
            />

            <div className="p-6 bg-[#1f2937] rounded-lg mt-8">
              <h3 className="text-2xl font-semibold mb-3">About Pie Charts</h3>
              <p className="text-gray-300">
                Pie charts are ideal for showing the proportion of parts to a
                whole. This visualization displays the distribution of sales
                across different customer types.
              </p>
              <p className="text-gray-400 mt-2">
                Each slice represents a customer type, with the size
                proportional to its percentage of total sales. Hover over any
                slice to see details.
              </p>
            </div>
          </>
        )}
      </div>

      <div
        className="footer"
        style={{ textAlign: "center", marginTop: "4rem", color: "#94a3b8" }}
      >
        <p>
          ExtJS Data Visualization Dashboard &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
