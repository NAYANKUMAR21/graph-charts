"use client";
import Link from "next/link";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesBarChart() {
  const [selectedBar, setSelectedBar] = useState(null);

  // Data extracted from your image
  const data = [
    { name: "Health and Beauty", value: 3403 },
    { name: "Sports and Outdoors", value: 5104 },
    { name: "Food and Beverages", value: 6987 },
    { name: "Electronics", value: 8507 },
    { name: "Home and Lifestyle", value: 7250 },
    { name: "Fashion", value: 4721 },
  ];

  const handleBarClick = (data, index) => {
    setSelectedBar(selectedBar === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 flex flex-col">
      <div className="max-w-6xl w-full mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-blue-400">
            Bar Chart Visualization
          </h1>
          <Link href="/">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all">
              Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Chart Container */}
        <div className="bg-slate-700/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:bg-slate-700/80 transition-all">
          <h2 className="text-2xl font-bold mb-4 text-blue-300">
            Total Sales by Product Line
          </h2>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barSize={60}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#444"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#475569" }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  tick={{ fill: "#cbd5e1" }}
                  tickLine={false}
                  axisLine={{ stroke: "#475569" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value) => [`$${value}`, "Total Sales"]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "0.5rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{ color: "#cbd5e1" }}
                  labelStyle={{ fontWeight: "bold", color: "#cbd5e1" }}
                />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  onClick={handleBarClick}
                  activeBar={{
                    fill: "#60a5fa",
                    stroke: "#2563eb",
                    strokeWidth: 2,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {selectedBar !== null && (
            <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-blue-500/30">
              <h3 className="font-semibold text-blue-300">
                {data[selectedBar].name}
              </h3>
              <p className="text-white text-lg">
                Total Sales:{" "}
                <span className="font-bold">${data[selectedBar].value}</span>
              </p>
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="bg-slate-700/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:bg-slate-700/80 transition-all">
          <h3 className="text-xl font-semibold mb-4 text-blue-300">
            About Bar Charts
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Bar charts are excellent for comparing categorical data. In this
            visualization, each bar represents the total sales for a product
            line. Click on any bar to see detailed information.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            The height of each bar is proportional to the total sales value,
            making it easy to compare performance across different product
            categories.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-gray-500 text-sm">
          ExtJS Data Visualization Dashboard &copy; 2025
        </div>
      </div>
    </div>
  );
}
