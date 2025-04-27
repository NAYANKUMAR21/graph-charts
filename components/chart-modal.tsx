"use client";

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  title: string;
  chartType: string;
}

export default function ChartModal({
  isOpen,
  onClose,
  data,
  title,
  chartType,
}: ChartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Details</h3>
            {chartType === "bar" && (
              <div>
                <p>
                  <strong>Category:</strong> {data.category}
                </p>
                <p>
                  <strong>Value:</strong> {data.value.toFixed(2)}
                </p>
                {data.additionalData && (
                  <>
                    <p>
                      <strong>Items:</strong> {data.additionalData.count}
                    </p>
                    <p>
                      <strong>Average Unit Price:</strong> $
                      {data.additionalData.avgUnitPrice.toFixed(2)}
                    </p>
                    <p>
                      <strong>Total Revenue:</strong> $
                      {data.additionalData.totalRevenue.toFixed(2)}
                    </p>
                  </>
                )}
              </div>
            )}
            {chartType === "pie" && (
              <div>
                <p>
                  <strong>Category:</strong> {data.category}
                </p>
                <p>
                  <strong>Value:</strong> {data.value.toFixed(2)}
                </p>
                <p>
                  <strong>Percentage:</strong> {data.percentage.toFixed(2)}%
                </p>
              </div>
            )}
            {chartType === "line" && (
              <div>
                <p>
                  <strong>Date:</strong> {data.date}
                </p>
                <p>
                  <strong>Value:</strong> {data.value.toFixed(2)}
                </p>
                {data.additionalData && (
                  <>
                    <p>
                      <strong>Transactions:</strong> {data.additionalData.count}
                    </p>
                    <p>
                      <strong>Average Transaction:</strong> $
                      {data.additionalData.avgTransaction.toFixed(2)}
                    </p>
                  </>
                )}
              </div>
            )}
            {chartType === "area" && (
              <div>
                <p>
                  <strong>Date:</strong> {data.date}
                </p>
                <p>
                  <strong>Gender:</strong> {data.gender}
                </p>
                <p>
                  <strong>Sales:</strong> ${data.value.toFixed(2)}
                </p>
                <p>
                  <strong>Percentage of Total:</strong>{" "}
                  {data.percentage.toFixed(2)}%
                </p>
              </div>
            )}
            {chartType !== "bar" &&
              chartType !== "pie" &&
              chartType !== "line" &&
              chartType !== "area" && (
                <pre className="bg-gray-800 p-3 rounded overflow-auto max-h-60">
                  {JSON.stringify(data, null, 2)}
                </pre>
              )}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
