"use client";

import * as React from "react";
import { IconFilter, IconRotateDot } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimpleDateRangeDialog } from "./simple-date-range-dialog";
import { useServiceStore } from "@/app/store/service-store";
import { useDentistStore } from "@/app/store/dentist-store";
import { Calendar as CalendarIcon, Stethoscope, User, X } from "lucide-react";
import { useServiceCategoryStore } from "@/app/store/service-category-store";

export function SalesReportFilters({ filters, onChange }: any) {
  const { services, fetchServices } = useServiceStore();
  const { categories, fetchAllCategories } = useServiceCategoryStore();
  const { dentists, fetchDentists } = useDentistStore();

  React.useEffect(() => {
    fetchServices();
    fetchDentists();
    fetchAllCategories();
  }, [fetchServices, fetchDentists, fetchAllCategories]);

  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== "all",
  );

  return (
    <Card className="p-5 border-none shadow-sm bg-white rounded-3xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
            <IconFilter className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Filter Data
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Refine your financial insights
            </p>
          </div>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({})}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg h-8"
          >
            <IconRotateDot className="size-3.5 mr-1.5" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {/* Date Range Selector */}
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-widest">
            Reporting Period
          </Label>
          <div className="relative">
            <SimpleDateRangeDialog
              value={{ from: filters.from, to: filters.to }}
              onChange={(range) =>
                onChange({ ...filters, from: range.from, to: range.to })
              }
            />
          </div>
        </div>

        {/* Service Selector */}
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-widest text-nowrap">
            Service Category
          </Label>
          <Select
            value={filters.categories ?? "all"}
            onValueChange={(val) =>
              onChange({
                ...filters,
                categories: val === "all" ? undefined : val,
              })
            }
          >
            <SelectTrigger className="bg-slate-50/50 border-slate-100 rounded-xl focus:ring-indigo-500/20 transition-all h-11 font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <Stethoscope className="size-4 text-slate-400" />
                <SelectValue placeholder="All Services" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100">
              <SelectItem value="all" className="font-bold text-indigo-600">
                All Services
              </SelectItem>
              {categories.map((s) => (
                <SelectItem
                  key={s.$id}
                  value={s.name}
                  className="text-slate-600"
                >
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dentist Selector */}
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-widest">
            Assigned Dentist
          </Label>
          <Select
            value={filters.dentist ?? "all"}
            onValueChange={(val) =>
              onChange({ ...filters, dentist: val === "all" ? undefined : val })
            }
          >
            <SelectTrigger className="bg-slate-50/50 border-slate-100 rounded-xl focus:ring-indigo-500/20 transition-all h-11 font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <User className="size-4 text-slate-400" />
                <SelectValue placeholder="All Dentists" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100">
              <SelectItem value="all" className="font-bold text-indigo-600">
                All Dentists
              </SelectItem>
              {dentists.map((d) => (
                <SelectItem
                  key={d.$id}
                  value={d.name}
                  className="text-slate-600"
                >
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Summary or Reset (Optional visual filler) */}
        <div className="flex items-end">
          <div className="w-full p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-center justify-between">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
              Active Filters
            </span>
            <div className="flex gap-1">
              <div
                className={`size-2 rounded-full ${filters.from ? "bg-indigo-500" : "bg-slate-200"}`}
              />
              <div
                className={`size-2 rounded-full ${filters.serviceType ? "bg-indigo-500" : "bg-slate-200"}`}
              />
              <div
                className={`size-2 rounded-full ${filters.dentist ? "bg-indigo-500" : "bg-slate-200"}`}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
