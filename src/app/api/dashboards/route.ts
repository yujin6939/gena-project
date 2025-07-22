let dashboards = [
  {
    id: "dashboard-1",
    name: "Marketing KPIs",
    charts: ["chart-1", "chart-2", "chart-3"]
  }
];

export async function GET() {
  return Response.json(dashboards);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newDashboard = {
    id: `dashboard-${dashboards.length + 1}`,
    name: body.name,
    charts: []
  };
  dashboards.push(newDashboard);
  return Response.json(newDashboard);
}
