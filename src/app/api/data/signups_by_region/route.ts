export async function GET() {
  return Response.json({
    chartId: "chart-1",
    labels: ["North America", "Europe", "Asia"],
    values: [120, 95, 180]
  });
}
