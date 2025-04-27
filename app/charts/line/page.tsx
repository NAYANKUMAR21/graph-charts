"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";

interface SalesDataPoint {
  date: string;
  total: number;
  count: number;
  avgTransaction: number;
}

export default function SalesLineChart() {
  const [data, setData] = useState<SalesDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  useEffect(() => {
    // Sample data to simulate localStorage retrieval
    const sampleData: SalesDataPoint[] = [
      { date: "2025-01-01", total: 4200, count: 23, avgTransaction: 182.6 },
      { date: "2025-01-02", total: 5300, count: 31, avgTransaction: 170.97 },
      { date: "2025-01-03", total: 3800, count: 18, avgTransaction: 211.11 },
      { date: "2025-01-04", total: 6500, count: 42, avgTransaction: 154.76 },
      { date: "2025-01-05", total: 7200, count: 45, avgTransaction: 160.0 },
      { date: "2025-01-06", total: 6800, count: 39, avgTransaction: 174.36 },
      { date: "2025-01-07", total: 8500, count: 52, avgTransaction: 163.46 },
      { date: "2025-01-08", total: 9100, count: 58, avgTransaction: 156.9 },
      { date: "2025-01-09", total: 7800, count: 49, avgTransaction: 159.18 },
      { date: "2025-01-10", total: 8900, count: 55, avgTransaction: 161.82 },
      { date: "2025-01-11", total: 7500, count: 47, avgTransaction: 159.57 },
      { date: "2025-01-12", total: 6900, count: 41, avgTransaction: 168.29 },
    ];

    setData(sampleData);
    setIsLoading(false);
  }, []);

  const handlePointClick = (point: SalesDataPoint, index: number) => {
    setSelectedPoint(selectedPoint === index ? null : index);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 flex flex-col">
      <div className="max-w-6xl w-full mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-blue-400">
            Line Chart Visualization
          </h1>
          <Link href="/">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all">
              Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Chart Container */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-blue-300">Loading data...</div>
          </div>
        ) : (
          <div className="bg-slate-700/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:bg-slate-700/80 transition-all">
            <h2 className="text-2xl font-bold mb-4 text-blue-300">
              Daily Sales Trend
            </h2>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  onClick={(data, index) => {
                    if (data && data.activePayload) {
                      handlePointClick(data.activePayload[0].payload, index);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#444"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#475569" }}
                    tickFormatter={formatDate}
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
                    formatter={(value, name) => [
                      name === "total" ? `$${value}` : value,
                      name === "total"
                        ? "Total Sales"
                        : name === "count"
                        ? "Transactions"
                        : "Avg. Transaction",
                    ]}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "0.5rem",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#cbd5e1" }}
                    labelStyle={{ fontWeight: "bold", color: "#cbd5e1" }}
                    labelFormatter={formatDate}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{
                      r: 6,
                      fill: "#3b82f6",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 8,
                      fill: "#60a5fa",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {selectedPoint !== null && (
              <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-blue-500/30">
                <h3 className="font-semibold text-blue-300">
                  Date: {formatDate(data[selectedPoint].date)}
                </h3>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-gray-400 text-sm">Total Sales</p>
                    <p className="text-white text-lg font-bold">
                      ${data[selectedPoint].total.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Transactions</p>
                    <p className="text-white text-lg font-bold">
                      {data[selectedPoint].count}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Avg. Transaction</p>
                    <p className="text-white text-lg font-bold">
                      ${data[selectedPoint].avgTransaction.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* About Section */}
        <div className="bg-slate-700/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:bg-slate-700/80 transition-all">
          <h3 className="text-xl font-semibold mb-4 text-blue-300">
            About Line Charts
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Line charts are perfect for showing trends over time. This
            visualization displays the total sales for each day in the dataset.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            The area under the line is shaded to emphasize the volume of sales.
            Hover over any data point to see details, or click for more
            information.
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
