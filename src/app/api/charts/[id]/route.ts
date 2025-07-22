const charts = [
  {
    id: "chart-1",
    dashboardId: "dashboard-1",
    type: "bar",
    title: "Signups by Region",
    dataEndpoint: "/api/data/signups_by_region",
    order: 0
  },
  {
    id: "chart-2",
    dashboardId: "dashboard-1",
    type: "line",
    title: "Orders Over Time",
    dataEndpoint: "/api/data/orders_over_time",
    order: 1
  },
  {
    id: "chart-3",
    dashboardId: "dashboard-1",
    type: "number",
    title: "Total Active Users",
    dataEndpoint: "/api/data/total_revenue",
    order: 2
  }
];

export async function GET(_: Request, context: { params: { id: string } }) {
  const chart = charts.find(c => c.id === context.params.id);
  if (!chart) return new Response("Not Found", { status: 404 });
  return Response.json(chart);
}

export async function DELETE(_, context) {
  const { id } = context.params;
  // ✅ TODO: charts 배열에서 해당 ID를 제거
  return new Response(null, { status: 204 });
}