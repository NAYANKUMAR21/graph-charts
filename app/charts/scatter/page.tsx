"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChartContainer from "@/components/chart-container";
import { type InvoiceData, getColorForIndex } from "@/utils/data-utils";
import { Button } from "@/components/ui/button";

export default function ScatterPlotPage() {
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

  const renderScatterPlot = (container: HTMLDivElement) => {
    if (!data.length) return;

    // Prepare data for scatter plot (unit price vs. quantity)
    const chartData = data.map((item) => ({
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      total: item.total,
      productLine: item.productLine,
      gender: item.gender,
      customerType: item.customerType,
    }));

    // Create the chart using vanilla JS/DOM
    const chartHeight = container.clientHeight - 60; // Leave space for labels
    const chartWidth = container.clientWidth - 100; // Leave space for y-axis

    const maxUnitPrice = Math.max(...chartData.map((d) => d.unitPrice)) * 1.1;
    const maxQuantity = Math.max(...chartData.map((d) => d.quantity)) * 1.1;

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
    yAxis.setAttribute("y2", "" + chartHeight);
    yAxis.setAttribute("stroke", "white");
    yAxis.setAttribute("stroke-width", "2");
    svg.appendChild(yAxis);

    // Add X-axis
    const xAxis = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    xAxis.setAttribute("x1", "50");
    xAxis.setAttribute("y1", "" + chartHeight);
    xAxis.setAttribute("x2", "" + chartHeight + 50);
    xAxis.setAttribute("y2", "" + chartHeight);
    xAxis.setAttribute("stroke", "white");
    xAxis.setAttribute("stroke-width", "2");
    svg.appendChild(xAxis);

    // Add Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = maxUnitPrice * (i / 5);
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
      const value = maxQuantity * (i / 5);
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
      label.textContent = Math.round(value).toString();
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
    xTitle.textContent = "Quantity";
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
    yTitle.textContent = "Unit Price ($)";
    svg.appendChild(yTitle);

    // Map product lines to colors
    const productLines = [...new Set(chartData.map((d) => d.productLine))];
    const productLineColors = Object.fromEntries(
      productLines.map((line, index) => [line, getColorForIndex(index)])
    );

    // Add data points
    chartData.forEach((item) => {
      const x = 50 + (item.quantity / maxQuantity) * chartWidth;
      const y = chartHeight - (item.unitPrice / maxUnitPrice) * chartHeight;

      // Scale point size based on total
      const maxPointSize = 12;
      const minPointSize = 4;
      const maxTotal = Math.max(...chartData.map((d) => d.total));
      const pointSize =
        minPointSize + (item.total / maxTotal) * (maxPointSize - minPointSize);

      const point = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      point.setAttribute("cx", x.toString());
      point.setAttribute("cy", y.toString());
      point.setAttribute("r", pointSize.toString());
      point.setAttribute("fill", productLineColors[item.productLine]);
      point.setAttribute("opacity", "0.7");
      point.setAttribute("stroke", "white");
      point.setAttribute("stroke-width", "1");

      // Add hover effect
      point.addEventListener("mouseover", () => {
        point.setAttribute("opacity", "1");
        point.setAttribute("stroke-width", "2");

        // Show tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.innerHTML = `
          <strong>${item.productLine}</strong><br>
          Unit Price: $${item.unitPrice.toFixed(2)}<br>
          Quantity: ${item.quantity}<br>
          Total: $${item.total.toFixed(2)}<br>
          Customer: ${item.customerType} (${item.gender})
        `;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y - 80}px`;
        container.appendChild(tooltip);
      });

      point.addEventListener("mouseout", () => {
        point.setAttribute("opacity", "0.7");
        point.setAttribute("stroke-width", "1");

        // Remove tooltip
        const tooltip = container.querySelector(".tooltip");
        if (tooltip) {
          container.removeChild(tooltip);
        }
      });

      // Add click event for modal
      point.addEventListener("click", () => {
        const event = new CustomEvent("chartItemClick", {
          detail: {
            productLine: item.productLine,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            total: item.total,
            customerType: item.customerType,
            gender: item.gender,
          },
        });
        window.dispatchEvent(event);
      });

      svg.appendChild(point);
    });

    // Add legend
    const legend = document.createElement("div");
    legend.className = "chart-legend";
    legend.style.position = "absolute";
    legend.style.top = "10px";
    legend.style.right = "10px";
    legend.style.maxWidth = "200px";
    legend.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    legend.style.padding = "10px";
    legend.style.borderRadius = "5px";

    productLines.forEach((line, index) => {
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      legendItem.style.display = "flex";
      legendItem.style.alignItems = "center";
      legendItem.style.marginBottom = "5px";

      const color = document.createElement("div");
      color.className = "legend-color";
      color.style.width = "12px";
      color.style.height = "12px";
      color.style.backgroundColor = productLineColors[line];
      color.style.marginRight = "5px";
      color.style.borderRadius = "50%";

      const label = document.createElement("span");
      label.textContent = line;
      label.style.fontSize = "12px";
      label.style.whiteSpace = "nowrap";
      label.style.overflow = "hidden";
      label.style.textOverflow = "ellipsis";

      legendItem.appendChild(color);
      legendItem.appendChild(label);
      legend.appendChild(legendItem);
    });

    container.appendChild(legend);
  };

  return (
    <div className="text-white">
      <div>
        <div className="text-center mt-10">
          <h1 className="text-4xl ">Scatter Plot Visualization</h1>
          <Link href="/">
            <Button className="bg-blue-400 mt-10">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <div>Loading data...</div>
          ) : (
            <>
              <div>
                <ChartContainer
                  title="Unit Price vs. Quantity by Product Line"
                  chartType="scatter"
                  renderChart={renderScatterPlot}
                />
              </div>

              <div className="p-4 bg-[#111] rounded-lg mb-4 mt-60">
                <h3 className="text-xl font-semibold mb-2">
                  About Scatter Plots
                </h3>
                <p>
                  Scatter plots are ideal for showing the relationship between
                  two variables. This visualization displays the relationship
                  between unit price and quantity for each transaction.
                </p>
                <p className="mt-2">
                  Each point represents a transaction, with the color indicating
                  the product line and the size representing the total sale
                  amount. Hover over any point to see details, or click for more
                  information.
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
    </div>
  );
}
