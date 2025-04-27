export interface InvoiceData {
  invoiceID: string;
  branch: string;
  city: string;
  customerType: string;
  gender: string;
  productLine: string;
  unitPrice: number;
  quantity: number;
  tax: number;
  total: number;
  date: string;
  time: string;
  payment: string;
  cogs: number;
  grossMarginPercentage: number;
  grossIncome: number;
  rating: number;
}

export function parseCSV(csvString: string): InvoiceData[] {
  // Split by newlines and filter out any empty lines
  const lines = csvString
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const record: any = {};

    headers.forEach((header, index) => {
      const value = values[index];
      if (!value) return; // Skip empty values

      // Convert header to camelCase
      const camelCaseHeader = header
        .toLowerCase()
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, "");

      // Convert numeric values
      if (
        [
          "unitPrice",
          "quantity",
          "tax",
          "total",
          "cogs",
          "grossMarginPercentage",
          "grossIncome",
          "rating",
        ].includes(camelCaseHeader)
      ) {
        record[camelCaseHeader] = Number.parseFloat(value) || 0;
      } else {
        record[camelCaseHeader] = value;
      }
    });

    return record as InvoiceData;
  });
}

export function groupDataByField(
  data: InvoiceData[],
  field: keyof InvoiceData
) {
  return data.reduce((groups, item) => {
    const key = item[field] as string;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, InvoiceData[]>);
}

export function calculateAverage(
  data: InvoiceData[],
  field: keyof InvoiceData
) {
  if (data.length === 0) return 0;
  const sum = data.reduce((total, item) => total + (item[field] as number), 0);
  return sum / data.length;
}

export function calculateSum(data: InvoiceData[], field: keyof InvoiceData) {
  return data.reduce((total, item) => total + (item[field] as number), 0);
}

export function getTopNByField(
  data: InvoiceData[],
  field: keyof InvoiceData,
  n: number
) {
  return [...data]
    .sort((a, b) => (b[field] as number) - (a[field] as number))
    .slice(0, n);
}

export function getUniqueValues(data: InvoiceData[], field: keyof InvoiceData) {
  return [...new Set(data.map((item) => item[field]))];
}

export function getColorForIndex(index: number, opacity = 1): string {
  const colors = [
    `rgba(0, 112, 243, ${opacity})`, // Blue
    `rgba(16, 185, 129, ${opacity})`, // Green
    `rgba(245, 158, 11, ${opacity})`, // Yellow
    `rgba(239, 68, 68, ${opacity})`, // Red
    `rgba(59, 130, 246, ${opacity})`, // Light Blue
    `rgba(107, 114, 128, ${opacity})`, // Gray
    `rgba(168, 85, 247, ${opacity})`, // Purple
    `rgba(236, 72, 153, ${opacity})`, // Pink
    `rgba(251, 146, 60, ${opacity})`, // Orange
    `rgba(20, 184, 166, ${opacity})`, // Teal
  ];

  return colors[index % colors.length];
}
