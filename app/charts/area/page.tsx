"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChartContainer from "@/components/chart-container";
import { type InvoiceData, getColorForIndex } from "@/utils/data-utils";
import { Button } from "@/components/ui/button";

export default function AreaChartPage() {
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

  const renderAreaChart = (container: HTMLDivElement) => {
    if (!data.length) return;

    // Group data by gender and date
    const dateMap = new Map<string, { male: number; female: number }>();

    data.forEach((item) => {
      const date = item.date;
      if (!dateMap.has(date)) {
        dateMap.set(date, { male: 0, female: 0 });
      }

      const current = dateMap.get(date)!;
      if (item.gender === "Male") {
        current.male += item.total;
      } else {
        current.female += item.total;
      }
      dateMap.set(date, current);
    });

    // Convert to array and sort by date
    const chartData = Array.from(dateMap.entries())
      .map(([date, values]) => ({
        date,
        male: values.male,
        female: values.female,
        total: values.male + values.female,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Create the chart using vanilla JS/DOM
    const chartHeight = container.clientHeight - 60; // Leave space for labels
    const chartWidth = container.clientWidth - 100; // Leave space for y-axis
    const maxValue = Math.max(...chartData.map((d) => d.total));

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
    yAxis.setAttribute("y2", chartHeight.toString());
    yAxis.setAttribute("stroke", "white");
    yAxis.setAttribute("stroke-width", "2");
    svg.appendChild(yAxis);

    // Add X-axis
    const xAxis = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    xAxis.setAttribute("x1", "50");
    xAxis.setAttribute("y1", chartHeight.toString());
    xAxis.setAttribute("x2", (chartWidth + 50).toString());
    xAxis.setAttribute("y2", chartHeight.toString());
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

    // Create male area
    let malePathData = "";
    let femalePathData = "";
    const malePoints: [number, number][] = [];
    const femalePoints: [number, number][] = [];
    const totalPoints: [number, number][] = [];

    chartData.forEach((item, index) => {
      const x = 50 + (index / (chartData.length - 1)) * chartWidth;
      const maleY = chartHeight - (item.male / maxValue) * chartHeight;
      const totalY = chartHeight - (item.total / maxValue) * chartHeight;

      if (index === 0) {
        malePathData = `M ${x} ${maleY}`;
        femalePathData = `M ${x} ${totalY}`;
      } else {
        malePathData += ` L ${x} ${maleY}`;
        femalePathData += ` L ${x} ${totalY}`;
      }

      malePoints.push([x, maleY]);
      femalePoints.push([x, totalY]);
      totalPoints.push([
        x,
        chartHeight - (item.total / maxValue) * chartHeight,
      ]);
    });

    // Add male area
    const maleArea = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    maleArea.setAttribute(
      "d",
      `${malePathData} L ${
        malePoints[malePoints.length - 1][0]
      } ${chartHeight} L ${malePoints[0][0]} ${chartHeight} Z`
    );
    maleArea.setAttribute("fill", getColorForIndex(0, 0.6));
    maleArea.setAttribute("stroke", "none");
    svg.appendChild(maleArea);

    // Add female area (on top of male)
    const femaleArea = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    femaleArea.setAttribute(
      "d",
      `${femalePathData} L ${femalePoints[femalePoints.length - 1][0]} ${
        malePoints[malePoints.length - 1][1]
      } L ${femalePoints[0][0]} ${malePoints[0][1]} Z`
    );
    femaleArea.setAttribute("fill", getColorForIndex(1, 0.6));
    femaleArea.setAttribute("stroke", "none");
    svg.appendChild(femaleArea);

    // Add male line
    const maleLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    maleLine.setAttribute("d", malePathData);
    maleLine.setAttribute("stroke", getColorForIndex(0));
    maleLine.setAttribute("stroke-width", "2");
    maleLine.setAttribute("fill", "none");
    svg.appendChild(maleLine);

    // Add female line
    const femaleLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    femaleLine.setAttribute("d", femalePathData);
    femaleLine.setAttribute("stroke", getColorForIndex(1));
    femaleLine.setAttribute("stroke-width", "2");
    femaleLine.setAttribute("fill", "none");
    svg.appendChild(femaleLine);

    // Add data points and interaction
    chartData.forEach((item, index) => {
      const x = malePoints[index][0];
      const maleY = malePoints[index][1];
      const femaleY = femalePoints[index][1];

      // Male point
      const malePoint = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      malePoint.setAttribute("cx", x.toString());
      malePoint.setAttribute("cy", maleY.toString());
      malePoint.setAttribute("r", "4");
      malePoint.setAttribute("fill", getColorForIndex(0));
      malePoint.setAttribute("stroke", "white");
      malePoint.setAttribute("stroke-width", "1");

      // Female point
      const femalePoint = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      femalePoint.setAttribute("cx", x.toString());
      femalePoint.setAttribute("cy", femaleY.toString());
      femalePoint.setAttribute("r", "4");
      femalePoint.setAttribute("fill", getColorForIndex(1));
      femalePoint.setAttribute("stroke", "white");
      femalePoint.setAttribute("stroke-width", "1");

      // Add hover effects
      [malePoint, femalePoint].forEach((point, pointIndex) => {
        const gender = pointIndex === 0 ? "Male" : "Female";
        const value = pointIndex === 0 ? item.male : item.female;
        const y = pointIndex === 0 ? maleY : femaleY;

        point.addEventListener("mouseover", () => {
          point.setAttribute("r", "6");

          // Show tooltip
          const tooltip = document.createElement("div");
          tooltip.className = "tooltip";
          tooltip.innerHTML = `
            <strong>Date: ${item.date}</strong><br>
            Gender: ${gender}<br>
            Sales: $${value.toFixed(2)}
          `;
          tooltip.style.left = `${x}px`;
          tooltip.style.top = `${y - 60}px`;
          container.appendChild(tooltip);
        });

        point.addEventListener("mouseout", () => {
          point.setAttribute("r", "4");

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
              date: item.date,
              gender,
              value,
              total: item.total,
              percentage: (value / item.total) * 100,
            },
          });
          window.dispatchEvent(event);
        });

        svg.appendChild(point);
      });

      // Add X-axis labels (for selected points to avoid overcrowding)
      if (
        index % Math.ceil(chartData.length / 8) === 0 ||
        index === chartData.length - 1
      ) {
        const label = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        label.setAttribute("x", x.toString());
        label.setAttribute("y", (chartHeight + 20).toString());
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", "white");
        label.setAttribute("font-size", "12");
        label.textContent = item.date;
        svg.appendChild(label);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gray-900 flex flex-col items-center p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
          Sales by Gender Visualization
        </h1>
        <Link href="/">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg transition">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Content Section */}
      <div className="w-full max-w-6xl  bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        {isLoading ? (
          <div className="text-center text-gray-300 text-xl">
            Loading data...
          </div>
        ) : (
          <>
            {/* Chart Section */}
            <div className="flex flex-col md:flex-row items-center justify-center ">
              {/* Chart */}
              <div className="w-full md:w-2/3 p-4  bg-opacity-20 rounded-xl shadow-lg">
                <ChartContainer
                  title="Sales by Gender Over Time"
                  chartType="area"
                  renderChart={renderAreaChart}
                />
              </div>

              </div>
              {/* Quantities Section */}
              {/* <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-6 bg-opacity-20 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  Total Sales
                </h2>
                <div className="space-y-6 text-lg text-white">
                  <div className="flex items-center justify-between w-full">
                    <span>👨 Male Sales:</span>
                    <span className="font-bold text-green-400">1245</span>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span>👩 Female Sales:</span>
                    <span className="font-bold text-pink-400">1350</span>
                  </div>
                </div>
              </div> */}

            {/* About Area Charts */}
            <div className="mt-10 p-6  bg-opacity-20 rounded-xl shadow-lg">
              <h3 className="text-3xl font-semibold text-white mb-4">
                About Area Charts
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Area charts are ideal for showing cumulative quantities over
                time. In this visualization, sales trends are separated by
                gender to better understand contributions at different periods.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                The stacked areas represent how male and female sales add up to
                the total. Hover over points for insights, or click on data
                points for detailed analysis.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-gray-400 text-sm">
        ExtJS Data Visualization Dashboard &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
