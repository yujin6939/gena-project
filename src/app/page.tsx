"use client";

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

  return (
    <div className="w-full flex flex-col items-center gap-6 max-w-6xl mx-auto px-6 py-12 text-center">
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
        <Input
          placeholder="Enter new dashboard name"
          value={newDashboardName}
          onChange={(e) => setNewDashboardName(e.target.value)}
          className="w-full sm:w-[250px] text-center"
        />
        <Button
          onClick={createDashboard}
          disabled={!newDashboardName.trim()}
          className="bg-[#f1d3ec] text-[#741b53] hover:bg-[#ecc6e3] border-none"
        >
          ➕ Create
        </Button>
        {selectedDashboard && (
          <Dialog open={chartDialogOpen} onOpenChange={setChartDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="bg-[#f1d3ec] text-[#741b53] hover:bg-[#ecc6e3] border-none"
              >
                ➕ Add Chart
              </Button>
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
      </div>

      <div className="flex flex-wrap justify-center gap-2 w-full">
        {dashboards.map((d) => (
          <div key={d.id} className="flex items-center gap-2 border px-3 py-1 rounded-md">
            {editingName === d.id ? (
              <>
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-40 text-center"
                />
                <Button onClick={() => updateDashboardName(d.id)} size="sm">✅</Button>
              </>
            ) : (
              <>
                <Button
                  variant={selectedDashboard?.id === d.id ? "default" : "outline"}
                  onClick={() => setSelectedDashboard(d)}
                  className={
                    selectedDashboard?.id === d.id
                      ? "bg-[#f1d3ec] text-[#741b53] hover:bg-[#ecc6e3] border-none"
                      : ""
                  }
                >
                  {d.name}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditedName(d.name);
                    setEditingName(d.id);
                  }}
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteDashboard(d.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="chart-list">
          {(provided) => (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {charts.map((chart, index) => (
<Draggable key={chart.id} draggableId={chart.id} index={index}>
  {(provided) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <Card className="p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
<CardContent onClick={() => setZoomedChart(chart)} className="cursor-pointer">
  <div className="flex justify-between items-start mb-2">
    <h2 className="text-lg font-semibold">{chart.title}</h2>
    <Button
      size="icon"
      variant="ghost"
      onClick={(e) => { e.stopPropagation(); deleteChart(chart.id); }} title="Delete" >
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
    </div>
  );
}
