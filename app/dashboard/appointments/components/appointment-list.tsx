"use client";

import * as React from "react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Eye,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Loader2,
} from "lucide-react";

import AppointmentDoc from "../types/AppointmentDoc";
import { Branch } from "../types/Branch";
import StatusBadge from "./StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppointmentListProps {
  appointments: AppointmentDoc[];
  loading: boolean;
  viewMode: string; // "today" | "week" | "month"
  headerRangeLabel: string;
  branches: Branch[];
  actionLoading: boolean;
  deleteLoading?: boolean;
  currentDate: Date | undefined;
  onDateChange: (date: Date) => void;
  onView: (appt: AppointmentDoc) => void;
  onAction: (appt: AppointmentDoc, status: "approved" | "cancelled") => void;
}

export function AppointmentList({
  appointments,
  loading,
  viewMode,
  headerRangeLabel,
  branches,
  actionLoading,
  deleteLoading,
  currentDate,
  onDateChange,
  onView,
  onAction,
}: AppointmentListProps) {
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [loading, hasLoadedOnce]);

  const getBranchName = (branchId: string) => {
    return branches.find((b) => b.$id === branchId)?.name ?? "—";
  };

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Clock className="h-10 w-10 mb-2 opacity-20" />
      <p className="text-sm font-medium">
        No appointments found for this range.
      </p>
    </div>
  );

  const groupedByDate = React.useMemo(() => {
    const map: Record<string, AppointmentDoc[]> = {};
    appointments.forEach((a) => {
      const dateKey = format(parseISO(a.date), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(a);
    });
    return map;
  }, [appointments]);

  const daysWithAppointments = React.useMemo(() => {
    return Object.keys(groupedByDate).map((dateStr) => parseISO(dateStr));
  }, [groupedByDate]);

  if (loading && !hasLoadedOnce) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="py-20 flex flex-col items-center justify-center">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground font-medium">
              Initializing schedule...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderMonthCalendar = () => {
    const monthStart = startOfMonth(currentDate || new Date());
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div
        className={`border rounded-xl overflow-hidden bg-white shadow-sm transition-opacity ${loading ? "opacity-50" : ""}`}
      >
        <div className="grid grid-cols-7 bg-slate-50 border-b">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayAppts = groupedByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toString()}
                className={`min-h-[140px] p-2 border-r border-b transition-colors hover:bg-slate-50/50 ${
                  !isCurrentMonth ? "bg-slate-50/30 text-slate-300" : "bg-white"
                } ${isToday ? "ring-1 ring-inset ring-indigo-500 z-10" : ""}`}
              >
                <div className={`flex justify-between items-center mb-2`}>
                  {isToday && (
                    <Badge className="text-[9px] h-4 bg-indigo-600 text-white">
                      TODAY
                    </Badge>
                  )}
                  <span
                    className={`text-xs ml-auto font-bold ${isToday ? "text-indigo-600" : "text-slate-500"}`}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayAppts.slice(0, 4).map((a) => (
                    <DropdownMenu key={a.$id}>
                      <DropdownMenuTrigger asChild>
                        <div
                          className={`text-[10px] px-2 py-1 rounded-md cursor-pointer truncate border shadow-sm font-semibold transition-transform active:scale-95 ${
                            a.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : a.status === "pending"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}
                        >
                          {a.time} {a.name}
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="center"
                        className="w-52 rounded-xl"
                      >
                        <DropdownMenuLabel className="text-[10px] uppercase text-slate-400">
                          Manage
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onView(a)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        {a.status === "pending" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onAction(a, "approved")}
                              className="text-emerald-600 gap-2 font-medium"
                            >
                              <Check className="h-4 w-4" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onAction(a, "cancelled")}
                              className="text-rose-600 gap-2 font-medium"
                            >
                              <X className="h-4 w-4" /> Decline
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                  {dayAppts.length > 4 && (
                    <div className="text-[9px] text-center font-bold text-slate-400 py-1">
                      + {dayAppts.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTableList = () => (
    <div className="space-y-4">
      <div className="hidden md:block bg-white shadow-lg overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full shadow-lg animate-in fade-in zoom-in duration-300">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span className="text-xs font-bold text-slate-600 tracking-tight">
                Updating List...
              </span>
            </div>
          </div>
        )}

        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-slate-700 text-xs">
                Schedule
              </TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">
                Patient
              </TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">
                Address
              </TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">
                Source
              </TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">
                Remarks
              </TableHead>
              <TableHead className="font-bold text-slate-700 text-xs">
                Status
              </TableHead>
              {/* <TableHead className="font-bold text-slate-700 text-xs">
                Approved / Declined Schedule
              </TableHead> */}
              <TableHead className="font-bold text-slate-700 text-xs">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {appointments.length > 0 ? (
              // If we are in "today" mode, filter the table to only show the selected day
              // while keeping counts visible in the calendar sidebar.
              appointments
                .filter(
                  (a) =>
                    viewMode !== "today" ||
                    (currentDate && isSameDay(parseISO(a.date), currentDate)),
                )
                .map((a) => (
                  <TableRow
                    key={a.$id}
                    className="group hover:bg-slate-50/80 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-indigo-700">
                          {a.time}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {format(parseISO(a.date), "MMM d, yyyy")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-[11px]">
                          {a.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <MapPin className="h-3 w-3" />{" "}
                          {getBranchName(a.branchId)}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <Stethoscope className="h-3 w-3 text-indigo-500" />{" "}
                          {a.address}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <Stethoscope className="h-3 w-3 text-indigo-500" />{" "}
                          {a.referralSource}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <MapPin className="h-3 w-3" />{" "}
                          {getBranchName(a.branchId)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <Stethoscope className="h-3 w-3 text-indigo-500" />{" "}
                          {a.note || "No Remarks"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <Stethoscope className="h-3 w-3 text-indigo-500" />{" "}
                          <StatusBadge status={a.status} />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {a.status === "pending" ? (
                          <div className="flex items-center bg-white border rounded-lg p-0.5 shadow-sm">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => onAction(a, "approved")}
                              disabled={actionLoading}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                              onClick={() => onAction(a, "cancelled")}
                              disabled={actionLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="w-px h-4 bg-slate-200 mx-1" />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-500"
                              onClick={() => onView(a)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold gap-2 rounded-lg"
                            onClick={() => onView(a)}
                          >
                            <Eye className="h-4 w-4" /> Details
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>{emptyState}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3 relative">
        {loading && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs font-bold">Refreshing...</span>
          </div>
        )}
        {appointments.length > 0
          ? appointments
              .filter(
                (a) =>
                  viewMode !== "today" ||
                  (currentDate && isSameDay(parseISO(a.date), currentDate)),
              )
              .map((a) => (
                <div
                  key={a.$id}
                  className="relative overflow-hidden bg-white border rounded-xl p-4 shadow-sm active:bg-slate-50 transition-colors"
                  onClick={() => onView(a)}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${a.status === "approved" ? "bg-emerald-500" : a.status === "pending" ? "bg-amber-500" : "bg-rose-500"}`}
                  />
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                        {a.time}
                      </span>
                      <h4 className="font-bold text-slate-900">{a.name}</h4>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-500 border-t pt-3">
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="h-3 w-3" /> {a.serviceName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> {getBranchName(a.branchId)}
                    </div>
                  </div>
                  {a.status === "pending" && (
                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold h-9 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction(a, "approved");
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-rose-600 border-rose-100 hover:bg-rose-50 font-bold h-9 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction(a, "cancelled");
                        }}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))
          : emptyState}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {viewMode === "today" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1 sticky top-6">
            <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Focus Date
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && onDateChange(date)}
                  className="w-full rounded-md border-2 border-slate-200"
                  modifiers={{
                    booked: daysWithAppointments,
                  }}
                  modifiersStyles={{
                    booked: {
                      backgroundColor: "#eef2ff",
                      color: "#4f46e5",
                      fontWeight: "bold",
                      borderRadius: "8px",
                    },
                  }}
                  components={{
                    Day: (props) => {
                      const { day, modifiers, ...buttonProps } = props;
                      const date = day.date;
                      const dateKey = format(date, "yyyy-MM-dd");
                      const count = groupedByDate[dateKey]?.length || 0;
                      const isSelected =
                        currentDate && isSameDay(date, currentDate);

                      return (
                        <td className="p-0 text-center w-full">
                          <button
                            type="button"
                            className={`relative w-full aspect-square flex items-center justify-center cursor-pointer rounded-md transition-colors ${
                              isSelected
                                ? "bg-indigo-600 text-white font-bold"
                                : "hover:bg-slate-100 text-slate-700"
                            }`}
                            onClick={() => onDateChange(date)}
                          >
                            {format(date, "d")}
                            {count > 0 && (
                              <span
                                className={`absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold shadow-sm ring-1 ring-white ${
                                  isSelected
                                    ? "bg-white text-indigo-600"
                                    : "bg-indigo-600 text-white"
                                }`}
                              >
                                {count}
                              </span>
                            )}
                          </button>
                        </td>
                      );
                    },
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                Daily Schedule
              </h3>
              <Badge variant="outline" className="bg-white font-bold">
                {headerRangeLabel}
              </Badge>
            </div>
            {renderTableList()}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {viewMode === "week" ? "Weekly Overview" : "Monthly Forecast"}
            </h3>
            <Badge
              variant="secondary"
              className="font-bold bg-indigo-50 text-indigo-700 border-indigo-100"
            >
              {headerRangeLabel}
            </Badge>
          </div>
          {viewMode === "month" ? renderMonthCalendar() : renderTableList()}
        </div>
      )}
    </div>
  );
}
