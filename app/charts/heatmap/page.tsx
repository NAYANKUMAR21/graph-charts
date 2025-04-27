"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChartContainer from "@/components/chart-container";
import { type InvoiceData, calculateSum } from "@/utils/data-utils";

export default function HeatMapPage() {
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

  const renderHeatMap = (container: HTMLDivElement) => {
    if (!data.length) return;

    // Group data by product line and branch
    const productLines = [...new Set(data.map((item) => item.productLine))];
    const branches = [...new Set(data.map((item) => item.branch))];

    // Create a matrix of sales data
    const salesMatrix: {
      productLine: string;
      branch: string;
      sales: number;
    }[] = [];

    productLines.forEach((productLine) => {
      const productItems = data.filter(
        (item) => item.productLine === productLine
      );

      branches.forEach((branch) => {
        const branchItems = productItems.filter(
          (item) => item.branch === branch
        );
        const sales = calculateSum(branchItems, "total");

        salesMatrix.push({
          productLine,
          branch,
          sales,
        });
      });
    });

    // Sort product lines by total sales
    const productLineTotals = productLines
      .map((productLine) => {
        const sales = calculateSum(
          data.filter((item) => item.productLine === productLine),
          "total"
        );
        return { productLine, sales };
      })
      .sort((a, b) => b.sales - a.sales);

    const sortedProductLines = productLineTotals.map(
      (item) => item.productLine
    );

    // Find max sales for color scaling
    const maxSales = Math.max(...salesMatrix.map((item) => item.sales));

    // Create the chart using vanilla JS/DOM
    const cellSize = 60;
    const cellPadding = 2;
    const labelWidth = 150;
    const labelHeight = 30;

    const chartWidth = labelWidth + (cellSize + cellPadding) * branches.length;
    const chartHeight =
      labelHeight + (cellSize + cellPadding) * sortedProductLines.length;

    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", chartWidth.toString());
    svg.setAttribute("height", chartHeight.toString());
    container.appendChild(svg);

    // Add product line labels (y-axis)
    sortedProductLines.forEach((productLine, index) => {
      const y = labelHeight + index * (cellSize + cellPadding) + cellSize / 2;

      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.setAttribute("x", (labelWidth - 10).toString());
      label.setAttribute("y", y.toString());
      label.setAttribute("text-anchor", "end");
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute("fill", "white");
      label.setAttribute("font-size", "12");

      // Truncate long product line names
      const displayName =
        productLine.length > 20
          ? productLine.substring(0, 18) + "..."
          : productLine;

      label.textContent = displayName;
      svg.appendChild(label);
    });

    // Add branch labels (x-axis)
    branches.forEach((branch, index) => {
      const x = labelWidth + index * (cellSize + cellPadding) + cellSize / 2;

      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.setAttribute("x", x.toString());
      label.setAttribute("y", (labelHeight / 2).toString());
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute("fill", "white");
      label.setAttribute("font-size", "12");
      label.setAttribute("font-weight", "bold");

      // Map branch code to city name
      const branchName =
        branch === "A" ? "Yangon" : branch === "B" ? "Mandalay" : "Naypyitaw";
      label.textContent = branchName;
      svg.appendChild(label);
    });

    // Add heat map cells
    salesMatrix.forEach((item) => {
      const productLineIndex = sortedProductLines.indexOf(item.productLine);
      const branchIndex = branches.indexOf(item.branch);

      if (productLineIndex === -1 || branchIndex === -1) return;

      const x = labelWidth + branchIndex * (cellSize + cellPadding);
      const y = labelHeight + productLineIndex * (cellSize + cellPadding);

      // Calculate color based on sales value
      const intensity = Math.min(item.sales / maxSales, 1);
      const color = getHeatMapColor(intensity);

      const cell = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      cell.setAttribute("x", x.toString());
      cell.setAttribute("y", y.toString());
      cell.setAttribute("width", cellSize.toString());
      cell.setAttribute("height", cellSize.toString());
      cell.setAttribute("fill", color);
      cell.setAttribute("stroke", "#000");
      cell.setAttribute("stroke-width", "1");

      // Add hover effect
      cell.addEventListener("mouseover", () => {
        cell.setAttribute("stroke", "white");
        cell.setAttribute("stroke-width", "2");

        // Show tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.innerHTML = `
          <strong>${item.productLine}</strong><br>
          Branch: ${
            item.branch === "A"
              ? "Yangon"
              : item.branch === "B"
              ? "Mandalay"
              : "Naypyitaw"
          }<br>
          Sales: $${item.sales.toFixed(2)}<br>
          Percentage: ${((item.sales / maxSales) * 100).toFixed(2)}%
        `;
        tooltip.style.left = `${x + cellSize}px`;
        tooltip.style.top = `${y}px`;
        container.appendChild(tooltip);
      });

      cell.addEventListener("mouseout", () => {
        cell.setAttribute("stroke", "#000");
        cell.setAttribute("stroke-width", "1");

        // Remove tooltip
        const tooltip = container.querySelector(".tooltip");
        if (tooltip) {
          container.removeChild(tooltip);
        }
      });

      // Add click event for modal
      cell.addEventListener("click", () => {
        const event = new CustomEvent("chartItemClick", {
          detail: {
            productLine: item.productLine,
            branch: item.branch,
            branchName:
              item.branch === "A"
                ? "Yangon"
                : item.branch === "B"
                ? "Mandalay"
                : "Naypyitaw",
            sales: item.sales,
            percentage: (item.sales / maxSales) * 100,
          },
        });
        window.dispatchEvent(event);
      });

      svg.appendChild(cell);

      // Add sales value text
      if (item.sales > 0) {
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", (x + cellSize / 2).toString());
        text.setAttribute("y", (y + cellSize / 2).toString());
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", intensity > 0.6 ? "white" : "black");
        text.setAttribute("font-size", "10");
        text.setAttribute("pointer-events", "none");

        // Format sales value
        const formattedSales =
          item.sales > 999
            ? `${(item.sales / 1000).toFixed(1)}K`
            : item.sales.toFixed(0);

        text.textContent = formattedSales;
        svg.appendChild(text);
      }
    });

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = chartWidth - legendWidth - 20;
    const legendY = chartHeight + 20;

    // Create gradient for legend
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);

    const gradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient"
    );
    gradient.setAttribute("id", "heatmap-gradient");
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "0%");
    defs.appendChild(gradient);

    // Add gradient stops
    const stops = [0, 0.2, 0.4, 0.6, 0.8, 1];
    stops.forEach((stop) => {
      const stopElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "stop"
      );
      stopElement.setAttribute("offset", `${stop * 100}%`);
      stopElement.setAttribute("stop-color", getHeatMapColor(stop));
      gradient.appendChild(stopElement);
    });

    // Add legend rectangle
    const legendRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    legendRect.setAttribute("x", legendX.toString());
    legendRect.setAttribute("y", legendY.toString());
    legendRect.setAttribute("width", legendWidth.toString());
    legendRect.setAttribute("height", legendHeight.toString());
    legendRect.setAttribute("fill", "url(#heatmap-gradient)");
    svg.appendChild(legendRect);

    // Add legend labels
    const legendLabels = [
      { value: 0, text: "$0" },
      { value: 0.5, text: `$${(maxSales / 2).toFixed(0)}` },
      { value: 1, text: `$${maxSales.toFixed(0)}` },
    ];

    legendLabels.forEach((label) => {
      const x = legendX + label.value * legendWidth;
      const y = legendY + legendHeight + 15;

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", x.toString());
      text.setAttribute("y", y.toString());
      text.setAttribute(
        "text-anchor",
        label.value === 0 ? "start" : label.value === 1 ? "end" : "middle"
      );
      text.setAttribute("fill", "white");
      text.setAttribute("font-size", "12");
      text.textContent = label.text;
      svg.appendChild(text);
    });

    // Helper function to generate heat map colors
    function getHeatMapColor(value: number): string {
      // Color gradient from blue (low) to red (high)
      const r = Math.round(255 * Math.min(1, value * 2));
      const g = Math.round(255 * Math.min(1, 2 - value * 2));
      const b = Math.round(100 * (1 - value));

      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Heat Map Visualization</h1>
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
              title="Sales Distribution by Product Line and Branch"
              chartType="heatmap"
              renderChart={renderHeatMap}
            />

            <div className="p-4 bg-[#111] rounded-lg mb-4">
              <h3 className="text-xl font-semibold mb-2">About Heat Maps</h3>
              <p>
                Heat maps use color to represent data values, making it easy to
                visualize complex data and identify patterns. This visualization
                displays sales distribution across product lines and branches.
              </p>
              <p className="mt-2">
                Each cell represents the sales for a specific product line at a
                specific branch, with the color intensity indicating the sales
                amount. Hover over any cell to see details, or click for more
                information.
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
