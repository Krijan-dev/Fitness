"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Scale } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/common/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { StatCard } from "@/components/common/StatCard";
import { ProgressBar } from "@/components/common/ProgressBar";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { WeightProgressChart } from "@/components/charts/WeightProgressChart";
import { WeightEntryRow } from "@/components/weight/WeightEntryRow";
import { WeightEntryModal } from "@/components/weight/WeightEntryModal";
import { useWeightStore } from "@/stores/weight.store";
import { useSettingsStore } from "@/stores/settings.store";
import {
  calculateWeightStats,
  filterEntriesByDateRange,
  filterEntriesByRange,
  exportWeightCsv,
  downloadTextFile,
  sortWeightEntries,
  type WeightChartRange,
} from "@/features/weight-tracker/utils";
import type { WeightEntry } from "@/types/weight";

const CHART_RANGE_OPTIONS: Array<{ value: WeightChartRange; label: string }> = [
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
  { value: "all", label: "All time" },
];

export function WeightTrackerContent() {
  const entries = useWeightStore((s) => s.entries);
  const addEntry = useWeightStore((s) => s.addEntry);
  const updateEntry = useWeightStore((s) => s.updateEntry);
  const removeEntry = useWeightStore((s) => s.removeEntry);

  const settings = useSettingsStore((s) => s.settings);
  const updateProfile = useSettingsStore((s) => s.updateProfile);

  const [chartRange, setChartRange] = useState<WeightChartRange>("month");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<WeightEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<WeightEntry | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const sorted = useMemo(() => sortWeightEntries(entries), [entries]);

  const chartData = useMemo(
    () => filterEntriesByRange(sorted, chartRange),
    [sorted, chartRange]
  );

  const listEntries = useMemo(() => {
    if (filterStart && filterEnd) {
      return filterEntriesByDateRange(sorted, filterStart, filterEnd);
    }
    return sorted;
  }, [sorted, filterStart, filterEnd]);

  const stats = useMemo(
    () =>
      calculateWeightStats(
        sorted,
        settings.profile.targetWeightKg ?? 0,
        settings.profile.heightCm
      ),
    [sorted, settings.profile.targetWeightKg, settings.profile.heightCm]
  );

  const showMessage = (message: string) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleSaveEntry = (data: Omit<WeightEntry, "id">) => {
    addEntry(data);
    updateProfile({ currentWeightKg: data.weight });
    showMessage("Weight entry added.");
  };

  const handleUpdateEntry = (id: string, updates: Partial<WeightEntry>) => {
    updateEntry(id, updates);
    if (updates.weight !== undefined) {
      updateProfile({ currentWeightKg: updates.weight });
    }
    showMessage("Entry updated.");
  };

  const handleExportCsv = () => {
    const csv = exportWeightCsv(sorted);
    downloadTextFile(
      csv,
      `mealprep-pro-weight-${new Date().toISOString().split("T")[0]}.csv`,
      "text/csv"
    );
    showMessage("Weight history exported.");
  };

  return (
    <>
      <PageHeader
        title="Weight Tracker"
        description="Log weight and waist measurements and track progress over time."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExportCsv} disabled={sorted.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Log weight
          </Button>
        </div>
      </PageHeader>

      {actionMessage ? (
        <div
          className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          {actionMessage}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current" value={`${stats.currentWeight} kg`} icon={Scale} />
        <StatCard
          label="Total change"
          value={`${stats.totalChange > 0 ? "+" : ""}${stats.totalChange.toFixed(1)} kg`}
          subValue={`From ${stats.startingWeight} kg`}
        />
        <StatCard
          label="Weekly change"
          value={`${stats.weeklyChange > 0 ? "+" : ""}${stats.weeklyChange.toFixed(1)} kg`}
        />
        <StatCard
          label="Monthly change"
          value={`${stats.monthlyChange > 0 ? "+" : ""}${stats.monthlyChange.toFixed(1)} kg`}
        />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Highest" value={`${stats.highestWeight} kg`} />
        <StatCard label="Lowest" value={`${stats.lowestWeight} kg`} />
        <StatCard label="Target" value={`${stats.targetWeight} kg`} />
        <StatCard
          label="BMI"
          value={stats.bmi !== null ? stats.bmi.toFixed(1) : "—"}
          subValue={
            settings.profile.heightCm
              ? `Height ${settings.profile.heightCm} cm`
              : "Set height in Settings"
          }
        />
      </div>

      {stats.targetWeight > 0 && stats.startingWeight > 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Progress toward target</CardTitle>
          </CardHeader>
          <ProgressBar
            label={`${stats.progressPercent}% toward ${stats.targetWeight} kg goal`}
            value={stats.progressPercent}
            max={100}
            color="success"
          />
        </Card>
      ) : null}

      <Card className="mb-6">
        <CardHeader className="flex flex-row flex-wrap items-end justify-between gap-4">
          <div>
            <CardTitle>Weight chart</CardTitle>
            <CardDescription>Weekly, monthly, and long-term trends</CardDescription>
          </div>
          <Select
            label="Range"
            value={chartRange}
            options={CHART_RANGE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            onChange={(e) => setChartRange(e.target.value as WeightChartRange)}
          />
        </CardHeader>
        {chartData.length > 0 ? (
          <WeightProgressChart data={chartData} />
        ) : (
          <p className="text-sm text-muted-foreground">No entries in this range.</p>
        )}
      </Card>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Filter from"
          type="date"
          value={filterStart}
          onChange={(e) => setFilterStart(e.target.value)}
        />
        <Input
          label="Filter to"
          type="date"
          value={filterEnd}
          onChange={(e) => setFilterEnd(e.target.value)}
        />
      </div>

      {listEntries.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No weight entries"
          description="Log your first weight entry to start tracking progress."
          actionLabel="Log weight"
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {listEntries.map((entry) => (
              <WeightEntryRow
                key={entry.id}
                entry={entry}
                onEdit={setEditEntry}
                onDelete={setDeleteEntry}
              />
            ))}
          </div>
        </Card>
      )}

      <WeightEntryModal
        entry={null}
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleSaveEntry}
      />

      <WeightEntryModal
        entry={editEntry}
        isOpen={editEntry !== null}
        onClose={() => setEditEntry(null)}
        onSave={() => {}}
        onUpdate={handleUpdateEntry}
      />

      <ConfirmDialog
        isOpen={deleteEntry !== null}
        onClose={() => setDeleteEntry(null)}
        onConfirm={() => {
          if (deleteEntry) {
            removeEntry(deleteEntry.id);
            setDeleteEntry(null);
            showMessage("Entry deleted.");
          }
        }}
        title="Delete entry"
        description={`Remove the weight entry from ${deleteEntry?.date}?`}
        confirmLabel="Delete"
        isDestructive
      />
    </>
  );
}
