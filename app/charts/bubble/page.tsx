"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChartContainer from "@/components/chart-container";
import {
  type InvoiceData,
  groupDataByField,
  calculateSum,
  calculateAverage,
  getColorForIndex,
} from "@/utils/data-utils";

export default function BubbleChartPage() {
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

  const renderBubbleChart = (container: HTMLDivElement) => {
    if (!data.length) return;

    // Group data by product line and branch
    const groupedByProductLine = groupDataByField(data, "productLine");

    // Calculate metrics for each product line and branch
    const chartData = Object.entries(groupedByProductLine).flatMap(
      ([productLine, items], productIndex) => {
        const branchGroups = groupDataByField(items, "branch");

        return Object.entries(branchGroups).map(
          ([branch, branchItems], branchIndex) => {
            const totalSales = calculateSum(branchItems, "total");
            const avgRating = calculateAverage(branchItems, "rating");
            const avgMargin = calculateAverage(
              branchItems,
              "grossMarginPercentage"
            );

            return {
              productLine,
              branch,
              totalSales,
              avgRating,
              avgMargin,
              count: branchItems.length,
              color: getColorForIndex(productIndex),
            };
          }
        );
      }
    );

    // Create the chart using vanilla JS/DOM
    const chartHeight = container.clientHeight - 60; // Leave space for labels
    const chartWidth = container.clientWidth - 100; // Leave space for y-axis

    const maxSales = Math.max(...chartData.map((d) => d.totalSales)) * 1.1;
    const maxRating = Math.max(...chartData.map((d) => d.avgRating)) * 1.1;
    const maxCount = Math.max(...chartData.map((d) => d.count));

    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.overflow = "visible";
    container.appendChild(svg);

    // Add Y-axis
    const yAxis = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    yAxis.setAttribute("x1", "50");
    yAxis.setAttribute("y1", "0");
    yAxis.setAttribute("x2", "50");
    yAxis.setAttribute("y2", chartHeight);
    yAxis.setAttribute("stroke", "white");
    yAxis.setAttribute("stroke-width", "2");
    svg.appendChild(yAxis);

    // Add X-axis
    const xAxis = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    xAxis.setAttribute("x1", "50");
    xAxis.setAttribute("y1", chartHeight);
    xAxis.setAttribute("x2", chartWidth + 50);
    xAxis.setAttribute("y2", chartHeight);
    xAxis.setAttribute("stroke", "white");
    xAxis.setAttribute("stroke-width", "2");
    svg.appendChild(xAxis);

    // Add Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = maxSales * (i / 5);
      const y = chartHeight - chartHeight * (i / 5);

      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.setAttribute("x", "45");
      label.setAttribute("y", y.toString());
      label.setAttribute("text-anchor", "end");
      label.setAttribute("fill", "white");
      label.setAttribute("font-size", "12");
      label.textContent = `$${Math.round(value)}`;
      svg.appendChild(label);

      const gridLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      gridLine.setAttribute("x1", "50");
      gridLine.setAttribute("y1", y.toString());
      gridLine.setAttribute("x2", (chartWidth + 50).toString());
      gridLine.setAttribute("y2", y.toString());
      gridLine.setAttribute("stroke", "rgba(255, 255, 255, 0.1)");
      gridLine.setAttribute("stroke-width", "1");
      svg.appendChild(gridLine);
    }

    // Add X-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = maxRating * (i / 5);
      const x = 50 + chartWidth * (i / 5);

      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.setAttribute("x", x.toString());
      label.setAttribute("y", (chartHeight + 20).toString());
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "white");
      label.setAttribute("font-size", "12");
      label.textContent = value.toFixed(1);
      svg.appendChild(label);

      const gridLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      gridLine.setAttribute("x1", x.toString());
      gridLine.setAttribute("y1", "0");
      gridLine.setAttribute("x2", x.toString());
      gridLine.setAttribute("y2", chartHeight.toString());
      gridLine.setAttribute("stroke", "rgba(255, 255, 255, 0.1)");
      gridLine.setAttribute("stroke-width", "1");
      svg.appendChild(gridLine);
    }

    // Add axis titles
    const xTitle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    xTitle.setAttribute("x", (chartWidth / 2 + 50).toString());
    xTitle.setAttribute("y", (chartHeight + 40).toString());
    xTitle.setAttribute("text-anchor", "middle");
    xTitle.setAttribute("fill", "white");
    xTitle.setAttribute("font-size", "14");
    xTitle.textContent = "Average Rating";
    svg.appendChild(xTitle);

    const yTitle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    yTitle.setAttribute("x", "-10");
    yTitle.setAttribute("y", (chartHeight / 2).toString());
    yTitle.setAttribute("text-anchor", "middle");
    yTitle.setAttribute("fill", "white");
    yTitle.setAttribute("font-size", "14");
    yTitle.setAttribute("transform", `rotate(-90, -10, ${chartHeight / 2})`);
    yTitle.textContent = "Total Sales ($)";
    svg.appendChild(yTitle);

    // Add bubbles
    chartData.forEach((item) => {
      const x = 50 + (item.avgRating / maxRating) * chartWidth;
      const y = chartHeight - (item.totalSales / maxSales) * chartHeight;

      // Scale bubble size based on count
      const minRadius = 5;
      const maxRadius = 30;
      const radius =
        minRadius + (item.count / maxCount) * (maxRadius - minRadius);

      const bubble = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      bubble.setAttribute("cx", x.toString());
      bubble.setAttribute("cy", y.toString());
      bubble.setAttribute("r", radius.toString());
      bubble.setAttribute("fill", item.color);
      bubble.setAttribute("fill-opacity", "0.7");
      bubble.setAttribute("stroke", "white");
      bubble.setAttribute("stroke-width", "1");

      // Add hover effect
      bubble.addEventListener("mouseover", () => {
        bubble.setAttribute("fill-opacity", "0.9");
        bubble.setAttribute("stroke-width", "2");

        // Show tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.innerHTML = `
          <strong>${item.productLine} (${item.branch})</strong><br>
          Total Sales: $${item.totalSales.toFixed(2)}<br>
          Average Rating: ${item.avgRating.toFixed(2)}<br>
          Average Margin: ${item.avgMargin.toFixed(2)}%<br>
          Transaction Count: ${item.count}
        `;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y - 100}px`;
        container.appendChild(tooltip);
      });

      bubble.addEventListener("mouseout", () => {
        bubble.setAttribute("fill-opacity", "0.7");
        bubble.setAttribute("stroke-width", "1");

        // Remove tooltip
        const tooltip = container.querySelector(".tooltip");
        if (tooltip) {
          container.removeChild(tooltip);
        }
      });

      // Add click event for modal
      bubble.addEventListener("click", () => {
        const event = new CustomEvent("chartItemClick", {
          detail: {
            productLine: item.productLine,
            branch: item.branch,
            totalSales: item.totalSales,
            avgRating: item.avgRating,
            avgMargin: item.avgMargin,
            count: item.count,
          },
        });
        window.dispatchEvent(event);
      });

      svg.appendChild(bubble);

      // Add label for large bubbles
      if (radius > 15) {
        const label = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        label.setAttribute("x", x.toString());
        label.setAttribute("y", y.toString());
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("dominant-baseline", "middle");
        label.setAttribute("fill", "white");
        label.setAttribute("font-size", "10");
        label.setAttribute("pointer-events", "none");

        // Abbreviate branch name
        const branchAbbr = item.branch.charAt(0);
        label.textContent = branchAbbr;
        svg.appendChild(label);
      }
    });

    // Add legend for product lines
    const productLines = [...new Set(chartData.map((d) => d.productLine))];

    const legend = document.createElement("div");
    legend.className = "chart-legend";
    legend.style.position = "absolute";
    legend.style.top = "10px";
    legend.style.right = "10px";
    legend.style.maxWidth = "200px";
    legend.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    legend.style.padding = "10px";
    legend.style.borderRadius = "5px";

    productLines.forEach((productLine, index) => {
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      legendItem.style.display = "flex";
      legendItem.style.alignItems = "center";
      legendItem.style.marginBottom = "5px";

      const color = document.createElement("div");
      color.className = "legend-color";
      color.style.width = "12px";
      color.style.height = "12px";
      color.style.backgroundColor = getColorForIndex(index);
      color.style.marginRight = "5px";
      color.style.borderRadius = "50%";

      const label = document.createElement("span");
      label.textContent = productLine;
      label.style.fontSize = "12px";
      label.style.whiteSpace = "nowrap";
      label.style.overflow = "hidden";
      label.style.textOverflow = "ellipsis";

      legendItem.appendChild(color);
      legendItem.appendChild(label);
      legend.appendChild(legendItem);
    });

    // Add branch legend
    const branchLegend = document.createElement("div");
    branchLegend.style.marginTop = "10px";
    branchLegend.style.borderTop = "1px solid rgba(255, 255, 255, 0.2)";
    branchLegend.style.paddingTop = "5px";

    const branchTitle = document.createElement("div");
    branchTitle.textContent = "Branch:";
    branchTitle.style.fontSize = "12px";
    branchTitle.style.fontWeight = "bold";
    branchTitle.style.marginBottom = "5px";
    branchLegend.appendChild(branchTitle);

    const branches = ["A", "B", "C"];
    branches.forEach((branch) => {
      const branchItem = document.createElement("div");
      branchItem.className = "legend-item";
      branchItem.style.display = "flex";
      branchItem.style.alignItems = "center";
      branchItem.style.marginBottom = "5px";

      const label = document.createElement("span");
      label.textContent = `${branch}: ${
        branch === "A" ? "Yangon" : branch === "B" ? "Mandalay" : "Naypyitaw"
      }`;
      label.style.fontSize = "12px";

      branchItem.appendChild(label);
      branchLegend.appendChild(branchItem);
    });

    legend.appendChild(branchLegend);
    container.appendChild(legend);
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Bubble Chart Visualization</h1>
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
              title="Product Performance by Branch"
              chartType="bubble"
              renderChart={renderBubbleChart}
            />

            <div className="p-4 bg-[#111] rounded-lg mb-4">
              <h3 className="text-xl font-semibold mb-2">
                About Bubble Charts
              </h3>
              <p>
                Bubble charts are an extension of scatter plots where a third
                dimension is added through the size of the bubbles. This
                visualization displays the relationship between sales and
                ratings for each product line and branch.
              </p>
              <p className="mt-2">
                Each bubble represents a product line at a specific branch, with
                the position showing sales (y-axis) and average rating (x-axis),
                and the size representing the number of transactions. Hover over
                any bubble to see details, or click for more information.
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
