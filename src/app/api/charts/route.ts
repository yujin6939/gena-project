let charts = [
  {
    id: "chart-1",
    dashboardId: "dashboard-1",
    type: "bar",
    title: "Signups by Region",
    dataEndpoint: "/api/data/signups_by_region",
    order: 0,
  },
  {
    id: "chart-2",
    dashboardId: "dashboard-1",
    type: "line",
    title: "Orders Over Time",
    dataEndpoint: "/api/data/orders_over_time",
    order: 1,
  },
];

export async function GET() {
  return Response.json(charts);
}
