"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChartContainer from "@/components/chart-container";
import { type InvoiceData, getColorForIndex } from "@/utils/data-utils";
import { Button } from "@/components/ui/button";

export default function ColumnChartPage() {
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

  const renderColumnChart = (container: HTMLDivElement) => {
    if (!data.length) return;

    // Group data by city and gender
    const cityGenderData: Record<string, Record<string, number>> = {};

    data.forEach((item) => {
      if (!cityGenderData[item.city]) {
        cityGenderData[item.city] = { Male: 0, Female: 0 };
      }

      cityGenderData[item.city][item.gender] += item.total;
    });

    // Convert to array format for charting
    const chartData = Object.entries(cityGenderData)
      .map(([city, genderData]) => ({
        city,
        male: genderData.Male,
        female: genderData.Female,
        total: genderData.Male + genderData.Female,
      }))
      .sort((a, b) => b.total - a.total);

    // Create the chart using vanilla JS/DOM
    const chartHeight = container.clientHeight - 60; // Leave space for labels
    const chartWidth = container.clientWidth - 100; // Leave space for y-axis

    const maxValue = Math.max(...chartData.map((d) => d.total));
    const barCount = chartData.length;
    const groupWidth = Math.min(80, (chartWidth - 100) / barCount);
    const barWidth = groupWidth * 0.4;
    const barSpacing = groupWidth * 0.2;

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
      const value = maxValue * (i / 5);
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

    // Add bars
    chartData.forEach((item, index) => {
      const groupX = 70 + index * groupWidth;

      // Male bar
      const maleHeight = (item.male / maxValue) * chartHeight;
      const maleX = groupX;
      const maleY = chartHeight - maleHeight;

      const maleBar = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      maleBar.setAttribute("x", maleX.toString());
      maleBar.setAttribute("y", maleY.toString());
      maleBar.setAttribute("width", barWidth.toString());
      maleBar.setAttribute("height", maleHeight.toString());
      maleBar.setAttribute("fill", getColorForIndex(0));

      // Female bar
      const femaleHeight = (item.female / maxValue) * chartHeight;
      const femaleX = groupX + barWidth + barSpacing;
      const femaleY = chartHeight - femaleHeight;

      const femaleBar = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      femaleBar.setAttribute("x", femaleX.toString());
      femaleBar.setAttribute("y", femaleY.toString());
      femaleBar.setAttribute("width", barWidth.toString());
      femaleBar.setAttribute("height", femaleHeight.toString());
      femaleBar.setAttribute("fill", getColorForIndex(1));

      // Add hover effects
      [
        { bar: maleBar, gender: "Male", value: item.male, x: maleX, y: maleY },
        {
          bar: femaleBar,
          gender: "Female",
          value: item.female,
          x: femaleX,
          y: femaleY,
        },
      ].forEach(({ bar, gender, value, x, y }) => {
        bar.addEventListener("mouseover", () => {
          bar.setAttribute(
            "fill",
            getColorForIndex(gender === "Male" ? 0 : 1, 0.8)
          );
          bar.setAttribute("stroke", "white");
          bar.setAttribute("stroke-width", "2");

          // Show tooltip
          const tooltip = document.createElement("div");
          tooltip.className = "tooltip";
          tooltip.innerHTML = `
            <strong>${item.city} - ${gender}</strong><br>
            Sales: $${value.toFixed(2)}<br>
            Percentage: ${((value / item.total) * 100).toFixed(2)}%
          `;
          tooltip.style.left = `${x + barWidth / 2}px`;
          tooltip.style.top = `${y - 60}px`;
          container.appendChild(tooltip);
        });

        bar.addEventListener("mouseout", () => {
          bar.setAttribute("fill", getColorForIndex(gender === "Male" ? 0 : 1));
          bar.removeAttribute("stroke");

          // Remove tooltip
          const tooltip = container.querySelector(".tooltip");
          if (tooltip) {
            container.removeChild(tooltip);
          }
        });

        // Add click event for modal
        bar.addEventListener("click", () => {
          const event = new CustomEvent("chartItemClick", {
            detail: {
              city: item.city,
              gender,
              value,
              total: item.total,
              percentage: (value / item.total) * 100,
            },
          });
          window.dispatchEvent(event);
        });

        svg.appendChild(bar);
      });

      // Add X-axis labels
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.setAttribute("x", (groupX + groupWidth / 2).toString());
      label.setAttribute("y", (chartHeight + 20).toString());
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "white");
      label.setAttribute("font-size", "12");
      label.textContent = item.city;
      svg.appendChild(label);
    });

    // Add legend
    const legend = document.createElement("div");
    legend.className = "chart-legend";
    legend.style.position = "absolute";
    legend.style.top = "10px";
    legend.style.right = "10px";

    const maleLegend = document.createElement("div");
    maleLegend.className = "legend-item";
    maleLegend.style.display = "flex";
    maleLegend.style.alignItems = "center";
    maleLegend.style.marginBottom = "5px";

    const maleColor = document.createElement("div");
    maleColor.className = "legend-color";
    maleColor.style.width = "12px";
    maleColor.style.height = "12px";
    maleColor.style.backgroundColor = getColorForIndex(0);
    maleColor.style.marginRight = "5px";

    const maleLabel = document.createElement("span");
    maleLabel.textContent = "Male";

    maleLegend.appendChild(maleColor);
    maleLegend.appendChild(maleLabel);
    legend.appendChild(maleLegend);

    const femaleLegend = document.createElement("div");
    femaleLegend.className = "legend-item";
    femaleLegend.style.display = "flex";
    femaleLegend.style.alignItems = "center";

    const femaleColor = document.createElement("div");
    femaleColor.className = "legend-color";
    femaleColor.style.width = "12px";
    femaleColor.style.height = "12px";
    femaleColor.style.backgroundColor = getColorForIndex(1);
    femaleColor.style.marginRight = "5px";

    const femaleLabel = document.createElement("span");
    femaleLabel.textContent = "Female";

    femaleLegend.appendChild(femaleColor);
    femaleLegend.appendChild(femaleLabel);
    legend.appendChild(femaleLegend);

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
              title="Sales by City and Gender"
              chartType="column"
              renderChart={renderColumnChart}
            />

            <div className="p-4 bg-[#111] rounded-lg mb-4 mt-60">
              <h3 className="text-xl font-semibold mb-2">
                About Column Charts
              </h3>
              <p>
                Column charts are excellent for comparing values across
                categories. This visualization displays sales by city, broken
                down by gender.
              </p>
              <p className="mt-2">
                Each group of columns represents a city, with separate columns
                for male and female customers. Hover over any column to see
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
