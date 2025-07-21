export async function GET() {
  return Response.json({
    chartId: "chart-2",
    labels: ["2025-07-01", "2025-07-02", "2025-07-03"],
    values: [32, 45, 41]
  });
}
