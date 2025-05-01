"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { parseCSV } from "@/utils/data-utils";
import { sampleData } from "@/data/sample-data";

export default function Dashboard() {
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    // Parse the CSV data and store it in localStorage
    const parsedData = parseCSV(sampleData);
    localStorage.setItem("invoiceData", JSON.stringify(parsedData));
    setIsDataLoaded(true);
  }, []);

  const chartTypes = [
    {
      name: "Bar Chart",
      path: "/charts/bar",
      description: "Compare sales by product line",
    },
    {
      name: "Line Chart",
      path: "/charts/line",
      description: "Track sales trends over time",
    },
    {
      name: "Pie Chart",
      path: "/charts/pie",
      description: "View distribution by customer type",
    },
    {
      name: "Area Chart",
      path: "/charts/area",
      description: "Analyze sales by gender over time",
    },
    {
      name: "Scatter Plot",
      path: "/charts/scatter",
      description: "Explore relationship between unit price and quantity",
    },
    {
      name: "Column Chart",
      path: "/charts/column",
      description: "Compare sales by city and gender",
    },
    {
      name: "Donut Chart",
      path: "/charts/donut",
      description: "Visualize payment method distribution",
    },
    {
      name: "Radar Chart",
      path: "/charts/radar",
      description: "Evaluate product performance across multiple metrics",
    },
    {
      name: "Bubble Chart",
      path: "/charts/bubble",
      description: "Analyze product performance by branch",
    },
    {
      name: "Heat Map",
      path: "/charts/heatmap",
      description: "View sales distribution across product lines and branches",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="py-10">
        <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          ExtJS Data Visualization Dashboard
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex justify-center items-start px-6 md:px-10 py-10">
        <div className="w-full max-w-7xl">
          {/* Welcome Section */}
          <section className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Welcome to Your Invoice Insights
            </h2>
            <p className="text-lg md:text-xl text-gray-300">
              Dive into dynamic charts and explore your data with interactive
              visualizations.
            </p>
          </section>

          {/* Charts Section */}
          {!isDataLoaded ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-2xl font-semibold animate-pulse text-blue-400">
                Loading data...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
              {chartTypes.map((chart) => (
                <Link href={chart.path} key={chart.path}>
                  <div className="h-full p-6 bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-3xl shadow-2xl transition-all hover:scale-105 cursor-pointer flex flex-col justify-between">
                    <h3 className="text-2xl font-bold mb-4 text-blue-300 break-words">
                      {chart.name}
                    </h3>
                    <p className="text-gray-300 break-words">
                      {chart.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* About Section */}
          <section className="mt-10 bg-white/10 backdrop-blur-lg p-8 md:p-10 rounded-3xl shadow-2xl text-center">
            <h2 className="text-3xl font-bold mb-6 text-purple-300">
              About This Dashboard
            </h2>
            <p className="text-lg text-gray-300 mb-4">
              Powered by ExtJS and Next.js, this dashboard blends Vercel's sleek
              UI philosophy with powerful data visualizations.
            </p>
            <p className="text-lg text-gray-300">
              Interact, analyze, and gain actionable insights from your invoice
              datasets, with detailed hover information and smooth modals for
              deeper dives.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        ExtJS Data Visualization Dashboard &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
