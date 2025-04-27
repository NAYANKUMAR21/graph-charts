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
    // Retrieve the parsed data from localStorage
    const storedData = localStorage.getItem("invoiceData");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
    setIsLoading(false);
  }, []);

  const renderPieChart = (container: HTMLDivElement) => {
    if (!data.length) return;

    // Group data by customer type
    const groupedData = groupDataByField(data, "customerType");

    // Calculate total sales for each customer type
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

    // Create the chart using vanilla JS/DOM
    const chartSize =
      Math.min(container.clientWidth, container.clientHeight) - 60;
    const centerX = chartSize / 2 + 30;
    const centerY = chartSize / 2 + 30;
    const radius = chartSize / 2 - 20;

    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${chartSize + 60} ${chartSize + 60}`);
    container.appendChild(svg);

    // Calculate pie slices
    let startAngle = 0;
    chartData.forEach((item) => {
      const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      // Calculate arc path
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

      // Create pie slice
      const slice = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      slice.setAttribute("d", pathData);
      slice.setAttribute("fill", item.color);
      slice.setAttribute("stroke", "#000");
      slice.setAttribute("stroke-width", "1");
      slice.setAttribute("data-customer-type", item.customerType);
      slice.setAttribute("data-value", item.sales.toString());
      slice.setAttribute("data-percentage", item.percentage.toString());

      // Add hover effect
      slice.addEventListener("mouseover", () => {
        // Pull out slice slightly
        const midAngle = startAngle + sliceAngle / 2;
        const pullDistance = 10;
        const translateX = pullDistance * Math.cos(midAngle);
        const translateY = pullDistance * Math.sin(midAngle);

        slice.setAttribute(
          "transform",
          `translate(${translateX} ${translateY})`
        );
        slice.setAttribute("stroke", "white");
        slice.setAttribute("stroke-width", "2");

        // Show tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.innerHTML = `
          <strong>${item.customerType}</strong><br>
          Sales: $${item.sales.toFixed(2)}<br>
          Percentage: ${item.percentage.toFixed(2)}%
        `;

        const tooltipX = centerX + (radius + 20) * Math.cos(midAngle);
        const tooltipY = centerY + (radius + 20) * Math.sin(midAngle);

        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;
        container.appendChild(tooltip);
      });

      slice.addEventListener("mouseout", () => {
        slice.removeAttribute("transform");
        slice.setAttribute("stroke", "#000");
        slice.setAttribute("stroke-width", "1");

        // Remove tooltip
        const tooltip = container.querySelector(".tooltip");
        if (tooltip) {
          container.removeChild(tooltip);
        }
      });

      // Add click event for modal
      slice.addEventListener("click", () => {
        const event = new CustomEvent("chartItemClick", {
          detail: {
            category: item.customerType,
            value: item.sales,
            percentage: item.percentage,
          },
        });
        window.dispatchEvent(event);
      });

      svg.appendChild(slice);

      // Add label
      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);

      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.setAttribute("x", labelX.toString());
      label.setAttribute("y", labelY.toString());
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "white");
      label.setAttribute("font-size", "14");
      label.setAttribute("font-weight", "bold");
      label.textContent = `${Math.round(item.percentage)}%`;
      svg.appendChild(label);

      startAngle = endAngle;
    });

    // Add legend
    const legend = document.createElement("div");
    legend.className = "chart-legend";
    legend.style.position = "absolute";
    legend.style.bottom = "10px";
    legend.style.left = "50%";
    legend.style.transform = "translateX(-50%)";
    legend.style.display = "flex";
    legend.style.justifyContent = "center";
    legend.style.flexWrap = "wrap";
    legend.style.gap = "10px";

    chartData.forEach((item) => {
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      legendItem.style.display = "flex";
      legendItem.style.alignItems = "center";
      legendItem.style.marginRight = "15px";

      const colorBox = document.createElement("div");
      colorBox.className = "legend-color";
      colorBox.style.width = "12px";
      colorBox.style.height = "12px";
      colorBox.style.backgroundColor = item.color;
      colorBox.style.marginRight = "5px";

      const label = document.createElement("span");
      label.textContent = `${item.customerType}: $${item.sales.toFixed(2)}`;

      legendItem.appendChild(colorBox);
      legendItem.appendChild(label);
      legend.appendChild(legendItem);
    });

    container.appendChild(legend);
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Pie Chart Visualization</h1>
        <Link href="/" className="nav-button">
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

            <div className="p-4 bg-[#111] rounded-lg mb-4">
              <h3 className="text-xl font-semibold mb-2">About Pie Charts</h3>
              <p>
                Pie charts are ideal for showing the proportion of parts to a
                whole. This visualization displays the distribution of sales
                across different customer types.
              </p>
              <p className="mt-2">
                Each slice represents a customer type, with the size
                proportional to its percentage of total sales. Hover over any
                slice to see details, or click for more information.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="footer">
        <p>
          ExtJS Data Visualization Dashboard &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
