const dashboards = [
  {
    id: "dashboard-1",
    name: "Marketing KPIs",
    charts: ["chart-1", "chart-2", "chart-3"],
  },
];

export async function GET(_: Request, context: { params: { id: string } }) {
  const dashboard = dashboards.find(d => d.id === context.params.id);
  if (!dashboard) return new Response("Not Found", { status: 404 });
  return Response.json(dashboard);
}

export async function PUT(req, context) {
  const { id } = context.params;
  const body = await req.json();
  // ✅ TODO: 해당 대시보드를 찾아 name, charts 등의 값을 업데이트
  return Response.json({ id, ...body });
}

export async function DELETE(_, context) {
  const { id } = context.params;
  // ✅ TODO: 해당 ID의 대시보드를 배열에서 제거
  return new Response(null, { status: 204 });
}