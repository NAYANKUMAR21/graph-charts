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
import { Button } from "@/components/ui/button";

export default function DonutChartPage() {
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

  const renderDonutChart = (container: HTMLDivElement) => {
    if (!data.length) return;

    // Group data by payment method
    const groupedData = groupDataByField(data, "payment");

    // Calculate total sales for each payment method
    const totalSales = calculateSum(data, "total");
    const chartData = Object.entries(groupedData)
      .map(([payment, items], index) => {
        const sales = calculateSum(items, "total");
        return {
          payment,
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
    const outerRadius = chartSize / 2 - 20;
    const innerRadius = outerRadius * 0.6; // Donut hole size

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

      // Calculate outer arc path
      const outerX1 = centerX + outerRadius * Math.cos(startAngle);
      const outerY1 = centerY + outerRadius * Math.sin(startAngle);
      const outerX2 = centerX + outerRadius * Math.cos(endAngle);
      const outerY2 = centerY + outerRadius * Math.sin(endAngle);

      // Calculate inner arc path
      const innerX1 = centerX + innerRadius * Math.cos(endAngle);
      const innerY1 = centerY + innerRadius * Math.sin(endAngle);
      const innerX2 = centerX + innerRadius * Math.cos(startAngle);
      const innerY2 = centerY + innerRadius * Math.sin(startAngle);

      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${outerX1} ${outerY1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2}`,
        `L ${innerX1} ${innerY1}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX2} ${innerY2}`,
        "Z",
      ].join(" ");

      // Create donut slice
      const slice = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      slice.setAttribute("d", pathData);
      slice.setAttribute("fill", item.color);
      slice.setAttribute("stroke", "#000");
      slice.setAttribute("stroke-width", "1");
      slice.setAttribute("data-payment", item.payment);
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
          <strong>${item.payment}</strong><br>
          Sales: $${item.sales.toFixed(2)}<br>
          Percentage: ${item.percentage.toFixed(2)}%
        `;

        const tooltipX = centerX + (outerRadius + 20) * Math.cos(midAngle);
        const tooltipY = centerY + (outerRadius + 20) * Math.sin(midAngle);

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
            category: item.payment,
            value: item.sales,
            percentage: item.percentage,
          },
        });
        window.dispatchEvent(event);
      });

      svg.appendChild(slice);

      // Add label
      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = (outerRadius + innerRadius) / 2;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);

      if (item.percentage > 5) {
        // Only add label if slice is big enough
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
      }

      startAngle = endAngle;
    });

    // Add center text
    const centerText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    centerText.setAttribute("x", centerX.toString());
    centerText.setAttribute("y", centerY.toString());
    centerText.setAttribute("text-anchor", "middle");
    centerText.setAttribute("fill", "white");
    centerText.setAttribute("font-size", "16");
    centerText.setAttribute("font-weight", "bold");
    centerText.textContent = `Total: $${totalSales.toFixed(2)}`;
    svg.appendChild(centerText);

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
      label.textContent = `${item.payment}: $${item.sales.toFixed(2)}`;

      legendItem.appendChild(colorBox);
      legendItem.appendChild(label);
      legend.appendChild(legendItem);
    });

    container.appendChild(legend);
  };

  return (
    <div className="text-white">
      <div className="text-center mt-10">
        <h1 className="text-4xl ">Scatter Plot Visualization</h1>
        <Link href="/">
          <Button className="bg-blue-400 mt-10">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="content">
        {isLoading ? (
          <div>Loading data...</div>
        ) : (
          <>
            <ChartContainer
              title="Sales Distribution by Payment Method"
              chartType="donut"
              renderChart={renderDonutChart}
            />

            <div className="p-4 bg-[#111] rounded-lg mb-4 mt-60">
              <h3 className="text-xl font-semibold mb-2">About Donut Charts</h3>
              <p>
                Donut charts are a variation of pie charts with a hole in the
                center. This visualization displays the distribution of sales
                across different payment methods.
              </p>
              <p className="mt-2">
                Each slice represents a payment method, with the size
                proportional to its percentage of total sales. The center
                displays the total sales amount. Hover over any slice to see
                details, or click for more information.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="text-center mt-10">
        <p>
          ExtJS Data Visualization Dashboard &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
