"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChartRenderer from "@/components/ChartRenderer";
import { Trash2, Pencil } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardApp() {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<any | null>(null);
  const [newDashboardName, setNewDashboardName] = useState("");
  const [charts, setCharts] = useState<any[]>([]);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [zoomedChart, setZoomedChart] = useState<any | null>(null);
  const [newChart, setNewChart] = useState({ title: "", type: "bar", dataEndpoint: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "dashboard" | "chart"; id: string } | null>(null);


  useEffect(() => {
    fetch("/api/dashboards")
      .then((res) => res.json())
      .then(setDashboards);
  }, []);

  useEffect(() => {
    if (selectedDashboard) {
      setCharts([]);
      fetch(`/api/dashboards/${selectedDashboard.id}`)
        .then((res) => res.json())
        .then((data) => {
          Promise.all(
            data.charts.map((chartId: string) =>
              fetch(`/api/charts/${chartId}`).then((res) => res.json())
            )
          ).then((loadedCharts) => {
            const sorted = loadedCharts.sort((a, b) => a.order - b.order);
            setCharts(sorted);
          });
        });
    } else {
      setCharts([]);
    }
  }, [selectedDashboard]);

  const createDashboard = () => {
    fetch("/api/dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDashboardName }),
    })
      .then((res) => res.json())
      .then((dashboard) => {
        setDashboards([...dashboards, dashboard]);
        setNewDashboardName("");
      });
  };

  const createChart = () => {
    if (!newChart.title || !newChart.type || !newChart.dataEndpoint) {
      alert("Please fill in all fields.");
      return;
    }

    const id = `chart-${Date.now()}`;
    const payload = {
      id,
      dashboardId: selectedDashboard.id,
      ...newChart,
      order: charts.length,
    };
    fetch("/api/charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((chart) => {
        setCharts([...charts, chart]);
        return fetch(`/api/dashboards/${selectedDashboard.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ charts: [...charts.map((c) => c.id), chart.id] }),
        });
      })
      .then(() => {
        setNewChart({ title: "", type: "bar", dataEndpoint: "" });
        setChartDialogOpen(false);
      });
  };

  const deleteDashboard = (id: string) => {
    fetch(`/api/dashboards/${id}`, { method: "DELETE" })
      .then(() => {
        setDashboards(dashboards.filter((d) => d.id !== id));
        if (selectedDashboard?.id === id) setSelectedDashboard(null);
      });
  };

  const updateDashboardName = (id: string) => {
    fetch(`/api/dashboards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editedName }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setDashboards(dashboards.map((d) => (d.id === id ? updated : d)));
        setEditingName(null);
      });
  };

  const deleteChart = (id: string) => {
    fetch(`/api/charts/${id}`, { method: "DELETE" })
      .then(() => {
        setCharts(charts.filter((c) => c.id !== id));
      });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(charts);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setCharts(reordered);

    if (selectedDashboard) {
      fetch(`/api/dashboards/${selectedDashboard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charts: reordered.map((c) => c.id),
        }),
      });
    }
  };

  const handleSelectDashboard = (d: any) => {
  setSelectedDashboard(d);

  // ripple 애니메이션 수동으로 트리거
  const btn = document.getElementById(`dashboard-btn-${d.id}`);
  if (btn) {
    btn.classList.remove("animate"); // 재사용 위해 remove 후 reflow
    void btn.offsetWidth; // 강제로 리플로우
    btn.classList.add("animate");
  }
};


return (
  <div className="w-full max-w-7xl mx-auto px-6 pt-[200px] pb-12 flex flex-row gap-6">

    {/* 왼쪽 패널 */}
    <div className="w-full max-w-[240px] flex flex-col gap-4">
      <Input
        placeholder="Enter dashboard name"
        value={newDashboardName}
        onChange={(e) => setNewDashboardName(e.target.value)}
        className="text-center"
      />
      <Button
        onClick={createDashboard}
        disabled={!newDashboardName.trim()}
        className="bg-[#f1d3ec] text-[#741b53] hover:bg-[#ecc6e3] border-none"
      >
        ➕ Create
      </Button>

<div className="h-[2px] bg-gray-300 my-3 rounded-full" />

      <div className="flex flex-col gap-2">
        {dashboards.map((d) => (
          <div key={d.id} className="flex items-center gap-2 border px-2 py-1 rounded-md">
            {editingName === d.id ? (
              <>
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-center"
                />
                <Button onClick={() => updateDashboardName(d.id)} size="sm">✅</Button>
              </>
            ) : (
              <>
                <Button
                  id={`dashboard-btn-${d.id}`}
                  onClick={() => handleSelectDashboard(d)}
                  className={cn(
                    "w-full max-w-[160px] text-left line-clamp-1 ripple-fill bg-transparent",
                    selectedDashboard?.id === d.id ? "text-[#741b53] animate" : ""
                  )}
                >
                  {d.name}
                </Button>

                <Button size="icon" variant="ghost" onClick={() => {
                  setEditedName(d.name);
                  setEditingName(d.id);
                }}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setDeleteTarget({ type: "dashboard", id: d.id });
                    setConfirmOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* 오른쪽 차트 영역 */}
      <div className="flex-1">
        {selectedDashboard && (
  <h1 className="text-2xl font-bold mb-4 text-[#741b53] truncate">
    {selectedDashboard.name}
  </h1>
)}
    
    <div className="flex flex-row flex-wrap gap-4 items-start">
      {/* 고정된 Add Chart 박스 */}
      {selectedDashboard && (
        <Dialog
          open={chartDialogOpen}
          onOpenChange={(open) => {
            setChartDialogOpen(open);
            if (!open) {
              setNewChart({ title: "", type: "bar", dataEndpoint: "" });
            }
          }}
        >
          <DialogTrigger asChild>
            <Card className="cursor-pointer flex items-center justify-center w-[1000px] h-[100px] bg-[#f1d3ec] hover:bg-[#ecc6e3] transition-colors duration-200">
              <CardContent className="flex items-center justify-center h-full">
                <span className="text-[#741b53] text-lg font-semibold">➕ Add Chart</span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="space-y-4 pt-[80px]">
            <Input
              placeholder="Chart Title"
              value={newChart.title}
              onChange={(e) => setNewChart({ ...newChart, title: e.target.value })}
              className="text-center"
            />
            <div className="flex gap-2 justify-center">
              {["bar", "line", "number"].map((type) => (
                <Button
                  key={type}
                  variant={newChart.type === type ? "default" : "outline"}
                  onClick={() => setNewChart({ ...newChart, type })}
                >
                  {type}
                </Button>
              ))}
            </div>
            <Input
              placeholder="/api/data/..."
              value={newChart.dataEndpoint}
              onChange={(e) => setNewChart({ ...newChart, dataEndpoint: e.target.value })}
              className="text-center"
            />
            <div className="flex justify-center">
              <Button
                onClick={createChart}
                disabled={!newChart.title || !newChart.type || !newChart.dataEndpoint}
              >
                Save Chart
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 차트 리스트 (드래그 가능) */}
      <DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="chart-list" direction="horizontal">
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className="flex flex-row flex-wrap gap-4"
      >
        {charts.length > 0 &&
                  charts.map((chart, index) => (
                    <Draggable key={chart.id} draggableId={chart.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={provided.draggableProps.style}
                        >
                          <Card className="p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                            <CardContent onClick={() => setZoomedChart(chart)} className="cursor-pointer">
                              <div className="flex justify-between items-start mb-2">
                                <h2 className="text-lg font-semibold">{chart.title}</h2>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget({ type: "chart", id: chart.id });
                                    setConfirmOpen(true);
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                              <ChartRenderer chart={chart} />
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
        </Droppable>
      </DragDropContext>

      {/* 차트 줌 팝업 */}
      <Dialog open={!!zoomedChart} onOpenChange={() => setZoomedChart(null)}>
        <DialogContent className="max-w-4xl w-full h-[80vh] overflow-auto space-y-4">
          {zoomedChart && (
            <>
              <h2 className="text-2xl font-semibold text-center">{zoomedChart.title}</h2>
              <div className="w-full h-[60vh] flex items-center justify-center">
                <ChartRenderer chart={zoomedChart} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
  <DialogContent className="space-y-4 text-center">
    <h2 className="text-xl font-semibold">Confirm delete?</h2>
    <p>This action cannot be undone.</p>
    <div className="flex justify-center gap-4 pt-4">
      <Button
        variant="destructive"
        onClick={() => {
          if (deleteTarget) {
            if (deleteTarget.type === "chart") deleteChart(deleteTarget.id);
            else if (deleteTarget.type === "dashboard") deleteDashboard(deleteTarget.id);
          }
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
      >
        Yes
      </Button>
      <Button variant="outline" onClick={() => setConfirmOpen(false)}>
        Cancel
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </div>
    </div>
  </div>
);

}
