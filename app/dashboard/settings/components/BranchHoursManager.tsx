"use client";

import * as React from "react";
import { databases } from "@/app/appwrite";
import { toast } from "sonner";
import { Loader2, Save, Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ID, Query } from "appwrite";

const DB = process.env.NEXT_PUBLIC_DATABASE_ID!;
const BRANCHES_COL = "branches";
const HOURS_COL = "clinichours";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function BranchHoursManager() {
  const [branches, setBranches] = React.useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>("");
  const [hours, setHours] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Load Branches
  React.useEffect(() => {
    databases.listDocuments(DB, BRANCHES_COL).then((res) => {
      setBranches(res.documents);
      setLoading(false);
    });
  }, []);

  // Load Hours whenever Branch changes
  React.useEffect(() => {
    if (!selectedBranchId) return;

    const fetchHours = async () => {
      setLoading(true);
      try {
        const res = await databases.listDocuments(DB, HOURS_COL, [
          Query.equal("branchId", selectedBranchId),
        ]);

        if (res.total === 0) {
          // If no hours exist for this branch, initialize them locally
          const initial = DAYS_OF_WEEK.map((day) => ({
            day,
            openTime: "09:00 AM",
            closeTime: "05:00 PM",
            isOpen: true,
            slotDuration: 30,
            branchId: selectedBranchId,
          }));
          setHours(initial);
        } else {
          // Sort by days of week order
          const sorted = [...res.documents].sort(
            (a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day),
          );
          setHours(sorted);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHours();
  }, [selectedBranchId]);

  const handleUpdateHour = (index: number, field: string, value: any) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setHours(newHours);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const dayData of hours) {
        if (dayData.$id) {
          // Update existing
          await databases.updateDocument(DB, HOURS_COL, dayData.$id, {
            openTime: dayData.openTime,
            closeTime: dayData.closeTime,
            isOpen: dayData.isOpen,
            slotDuration: Number(dayData.slotDuration),
          });
        } else {
          // Create new entry linked to branch
          await databases.createDocument(DB, HOURS_COL, ID.unique(), dayData);
        }
      }
      toast.success("Branch hours updated successfully!");
    } catch (e) {
      toast.error("Failed to save hours.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3">
          <Building2 className="text-primary" />
          <h2 className="text-lg font-bold">Branch Operations</h2>
        </div>
        <Select onValueChange={setSelectedBranchId} value={selectedBranchId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a branch to configure" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((b) => (
              <SelectItem key={b.$id} value={b.$id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedBranchId && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-sm font-semibold">Day</th>
                <th className="p-4 text-sm font-semibold">Status</th>
                <th className="p-4 text-sm font-semibold">Open</th>
                <th className="p-4 text-sm font-semibold">Close</th>
                <th className="p-4 text-sm font-semibold">Slot (min)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {hours.map((h, idx) => (
                <tr
                  key={idx}
                  className={h.isOpen ? "" : "bg-slate-50/50 opacity-60"}
                >
                  <td className="p-4 font-medium">{h.day}</td>
                  <td className="p-4">
                    <Switch
                      checked={h.isOpen}
                      onCheckedChange={(val) =>
                        handleUpdateHour(idx, "isOpen", val)
                      }
                    />
                  </td>
                  <td className="p-4">
                    <Input
                      disabled={!h.isOpen}
                      value={h.openTime}
                      onChange={(e) =>
                        handleUpdateHour(idx, "openTime", e.target.value)
                      }
                      placeholder="09:00 AM"
                      className="w-28"
                    />
                  </td>
                  <td className="p-4">
                    <Input
                      disabled={!h.isOpen}
                      value={h.closeTime}
                      onChange={(e) =>
                        handleUpdateHour(idx, "closeTime", e.target.value)
                      }
                      placeholder="05:00 PM"
                      className="w-28"
                    />
                  </td>
                  <td className="p-4">
                    <Input
                      type="number"
                      disabled={!h.isOpen}
                      value={h.slotDuration}
                      onChange={(e) =>
                        handleUpdateHour(idx, "slotDuration", e.target.value)
                      }
                      className="w-20"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-slate-50 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Save className="mr-2" />
              )}
              Save Configuration
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
