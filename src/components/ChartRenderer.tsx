"use client";
import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";

export default function ChartRenderer({ chart }: { chart: any }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(chart.dataEndpoint)
      .then((res) => res.json())
      .then(setData);
  }, [chart.dataEndpoint]);

  if (!data) return <p>Loading...</p>;

  if (chart.type === "number") {
    return <h1 className="text-3xl font-bold">{data.value}</h1>;
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: chart.title,
        data: data.values,
        backgroundColor: "#89eedc",
        borderColor: "#89eedc",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-full flex justify-center items-center">
      {chart.type === "bar" ? (
        <Bar data={chartData} />
      ) : (
        <Line data={chartData} />
      )}
    </div>
  );
}
