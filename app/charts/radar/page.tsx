"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChartContainer from "@/components/chart-container";
import {
  type InvoiceData,
  groupDataByField,
  calculateAverage,
  getColorForIndex,
} from "@/utils/data-utils";
import { Button } from "@/components/ui/button";

export default function RadarChartPage() {
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

  const renderRadarChart = (container: HTMLDivElement) => {
    if (!data.length) return;

    // Group data by product line
    const groupedData = groupDataByField(data, "productLine");

    // Calculate average metrics for each product line
    const metrics = [
      "unitPrice",
      "quantity",
      "grossMarginPercentage",
      "rating",
    ] as const;

    const chartData = Object.entries(groupedData).map(
      ([productLine, items], index) => {
        const values = metrics.reduce((acc, metric) => {
          acc[metric] = calculateAverage(items, metric);
          return acc;
        }, {} as Record<(typeof metrics)[number], number>);

        return {
          productLine,
          ...values,
          color: getColorForIndex(index),
        };
      }
    );

    // Find max values for each metric for scaling
    const maxValues = metrics.reduce((acc, metric) => {
      acc[metric] = Math.max(...chartData.map((d) => d[metric])) * 1.1;
      return acc;
    }, {} as Record<(typeof metrics)[number], number>);

    // Create the chart using vanilla JS/DOM
    const chartSize =
      Math.min(container.clientWidth, container.clientHeight) - 60;
    const centerX = chartSize / 2 + 30;
    const centerY = chartSize / 2 + 30;
    const radius = chartSize / 2 - 40;

    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${chartSize + 60} ${chartSize + 60}`);
    container.appendChild(svg);

    // Draw radar grid
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius * level) / levels;

      const polygon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon"
      );
      const points = metrics
        .map((_, i) => {
          const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
          const x = centerX + levelRadius * Math.cos(angle);
          const y = centerY + levelRadius * Math.sin(angle);
          return `${x},${y}`;
        })
        .join(" ");

      polygon.setAttribute("points", points);
      polygon.setAttribute("fill", "none");
      polygon.setAttribute("stroke", "rgba(255, 255, 255, 0.2)");
      polygon.setAttribute("stroke-width", "1");
      svg.appendChild(polygon);
    }

    // Draw axis lines
    metrics.forEach((_, i) => {
      const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", centerX.toString());
      line.setAttribute("y1", centerY.toString());
      line.setAttribute("x2", x.toString());
      line.setAttribute("y2", y.toString());
      line.setAttribute("stroke", "rgba(255, 255, 255, 0.5)");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);

      // Add axis labels
      const labelRadius = radius + 20;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);

      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.setAttribute("x", labelX.toString());
      label.setAttribute("y", labelY.toString());
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "white");
      label.setAttribute("font-size", "12");

      // Format metric name for display
      const metricName = metrics[i]
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      label.textContent = metricName;
      svg.appendChild(label);
    });

    // Draw data polygons
    chartData.forEach((item) => {
      const points = metrics.map((metric, i) => {
        const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
        const value = item[metric] / maxValues[metric];
        const x = centerX + radius * value * Math.cos(angle);
        const y = centerY + radius * value * Math.sin(angle);
        return { x, y, metric, value: item[metric] };
      });

      // Create polygon
      const polygon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon"
      );
      polygon.setAttribute(
        "points",
        points.map((p) => `${p.x},${p.y}`).join(" ")
      );
      polygon.setAttribute("fill", item.color);
      polygon.setAttribute("fill-opacity", "0.5");
      polygon.setAttribute("stroke", item.color);
      polygon.setAttribute("stroke-width", "2");
      polygon.setAttribute("data-product-line", item.productLine);

      // Add hover effect
      polygon.addEventListener("mouseover", () => {
        polygon.setAttribute("fill-opacity", "0.8");
        polygon.setAttribute("stroke-width", "3");

        // Show tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.innerHTML = `
          <strong>${item.productLine}</strong><br>
          ${metrics
            .map((metric) => {
              const metricName = metric
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());
              return `${metricName}: ${item[metric].toFixed(2)}`;
            })
            .join("<br>")}
        `;
        tooltip.style.left = `${centerX}px`;
        tooltip.style.top = `${centerY - 100}px`;
        container.appendChild(tooltip);
      });

      polygon.addEventListener("mouseout", () => {
        polygon.setAttribute("fill-opacity", "0.5");
        polygon.setAttribute("stroke-width", "2");

        // Remove tooltip
        const tooltip = container.querySelector(".tooltip");
        if (tooltip) {
          container.removeChild(tooltip);
        }
      });

      // Add click event for modal
      polygon.addEventListener("click", () => {
        const event = new CustomEvent("chartItemClick", {
          detail: {
            productLine: item.productLine,
            metrics: metrics.reduce((acc, metric) => {
              acc[metric] = item[metric];
              return acc;
            }, {} as Record<string, number>),
          },
        });
        window.dispatchEvent(event);
      });

      svg.appendChild(polygon);

      // Add data points
      points.forEach((point) => {
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", point.x.toString());
        circle.setAttribute("cy", point.y.toString());
        circle.setAttribute("r", "4");
        circle.setAttribute("fill", item.color);
        circle.setAttribute("stroke", "white");
        circle.setAttribute("stroke-width", "1");
        svg.appendChild(circle);
      });
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
      label.textContent = item.productLine;

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
              title="Product Line Performance Metrics"
              chartType="radar"
              renderChart={renderRadarChart}
            />

            <div className="p-4 bg-[#111] rounded-lg mb-4 mt-60">
              <h3 className="text-xl font-semibold mb-2">About Radar Charts</h3>
              <p>
                Radar charts (also known as spider or web charts) are useful for
                comparing multiple quantitative variables. This visualization
                displays key performance metrics for each product line.
              </p>
              <p className="mt-2">
                Each axis represents a different metric, and each polygon
                represents a product line. The distance from the center
                indicates the relative value for that metric. Hover over any
                polygon to see details, or click for more information.
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
