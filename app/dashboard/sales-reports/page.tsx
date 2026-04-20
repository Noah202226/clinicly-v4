"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  PieChart as PieIcon,
  Activity,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useTransactionStore } from "@/app/store/transaction-store";
import { useExpenseStore } from "@/app/store/expense-store";
import { useBranchStore } from "@/app/store/branch-store";
import { usePatientStore } from "@/app/store/patientStore";

import { SalesReportFilters } from "./components/sales-filters";
import { TransactionTable } from "./components/sales-table";
import { ExpenseTable } from "./components/expense-table";
import { exportFinancialReportExcel } from "@/lib/exportExcel";

const COLORS = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function SalesReportPage() {
  const { transactions, fetchAllTransactions } = useTransactionStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { currentBranchId } = useBranchStore();
  const { fetchPatients, patientNameMap } = usePatientStore();

  const [filters, setFilters] = React.useState<any>({});

  React.useEffect(() => {
    fetchAllTransactions();
    if (currentBranchId) {
      fetchExpenses({ branchId: currentBranchId });
      fetchPatients(currentBranchId);
    }
  }, [currentBranchId]);

  // --- FILTERED DATA ---
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      if (currentBranchId && t.branch !== currentBranchId) return false;
      if (filters.categories && t.category !== filters.categories) return false;
      if (filters.dentist && t.dentist !== filters.dentist) return false;
      if (filters.from || filters.to) {
        const tDate = new Date(t.date).setHours(0, 0, 0, 0);
        if (filters.from && tDate < new Date(filters.from).setHours(0, 0, 0, 0))
          return false;
        if (filters.to && tDate > new Date(filters.to).setHours(0, 0, 0, 0))
          return false;
      }
      return true;
    });
  }, [transactions, filters, currentBranchId]);

  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((e) => {
      if (filters.from || filters.to) {
        const eDate = new Date(e.date).setHours(0, 0, 0, 0);
        if (filters.from && eDate < new Date(filters.from).setHours(0, 0, 0, 0))
          return false;
        if (filters.to && eDate > new Date(filters.to).setHours(0, 0, 0, 0))
          return false;
      }
      return true;
    });
  }, [expenses, filters]);

  // --- ANALYTICS DATA PREPARATION ---

  // 1. Service Distribution (Pie Chart)
  const serviceData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      counts[t.serviceType] = (counts[t.serviceType] || 0) + (t.amount || 0);
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  // 2. Revenue Trend (Line Chart)
  const trendData = React.useMemo(() => {
    const daily: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      const d = new Date(t.date).toLocaleDateString();
      daily[d] = (daily[d] || 0) + (t.amount || 0);
    });
    return Object.entries(daily)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredTransactions]);

  // 3. Dentist Performance (Bar Chart)
  const dentistData = React.useMemo(() => {
    const perf: Record<
      string,
      { name: string; revenue: number; patients: number }
    > = {};

    filteredTransactions.forEach((t) => {
      const dName = t.dentist || "Unassigned";
      if (!perf[dName]) {
        perf[dName] = { name: dName, revenue: 0, patients: 0 };
      }
      perf[dName].revenue += t.amount || 0;
      perf[dName].patients += 1;
    });

    return Object.values(perf).sort((a, b) => b.revenue - a.revenue);
  }, [filteredTransactions]);

  const expenseCategoryData = React.useMemo(() => {
    const categories: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category || "General";
      categories[cat] = (categories[cat] || 0) + (e.amount || 0);
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const totalSales = filteredTransactions.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0,
  );
  const totalExp = filteredExpenses.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0,
  );
  const netIncome = totalSales - totalExp;

  const handleExport = () => {
    // I-format ang data para sa Excel
    const salesData = filteredTransactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      Patient: patientNameMap[t.patientId] || "Unknown",
      Service: t.serviceType,
      Dentist: t.dentist || "Unassigned",
      Amount: t.amount,
    }));

    const expenseData = filteredExpenses.map((e) => ({
      Date: new Date(e.date).toLocaleDateString(),
      Description: e.description,
      Category: e.category || "General",
      Amount: e.amount,
    }));

    exportFinancialReportExcel(
      salesData,
      expenseData,
      filters,
      "Egargue Dental Group Financial Report",
    );
  };

  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-slate-50/50 min-h-screen">
      {/* Filters */}
      <SalesReportFilters filters={filters} onChange={setFilters} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Financial Reports 📈
          </h2>
          <p className="text-slate-500 font-medium">
            Detailed financial health of your clinic.
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
        >
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Gross Sales"
          value={totalSales}
          icon={<TrendingUp />}
          color="green"
        />
        <StatsCard
          title="Total Expenses"
          value={totalExp}
          icon={<ArrowDownCircle />}
          color="red"
        />
        <StatsCard
          title="Net Profit"
          value={netIncome}
          icon={<Wallet />}
          color="indigo"
          isDark
        />
      </div>

      {/* /* --- CHARTS SECTION --- */}
      <div className="space-y-6">
        {/* TOP ROW: Main Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 border-none shadow-sm rounded-3xl bg-white p-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="size-5 text-indigo-500" /> Revenue vs
                Expense Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={10}
                    tickFormatter={(v) => `₱${v / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "15px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(v: any) => `₱${v.toLocaleString()}`}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    name="Sales"
                    type="monotone"
                    dataKey="amount"
                    stroke="#4f46e5"
                    strokeWidth={4}
                    dot={{ r: 4, fill: "#4f46e5" }}
                    activeDot={{ r: 8 }}
                  />
                  {/* Opsyonal: Dagdagan ng Expense Line kung may trend data ang expenses */}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-none shadow-sm rounded-3xl bg-white p-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <PieIcon className="size-5 text-rose-500" /> Expense Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              {expenseCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseCategoryData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            ["#f43f5e", "#fb7185", "#fda4af", "#fff1f2"][i % 4]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `₱${v.toLocaleString()}`} />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                  No expense data for this period.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* BOTTOM ROW: Dentist & Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dentist Performance */}
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-700">
                Top Performing Dentists
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dentistData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar
                    dataKey="revenue"
                    fill="#6366f1"
                    radius={[0, 10, 10, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Service Revenue */}
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-700">
                Revenue by Service
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="value" fill="#10b981" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for Data Tables */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="sales" className="rounded-lg font-bold px-6">
            Sales Log
          </TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg font-bold px-6">
            Expense Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card className="border-none shadow-md rounded-2xl overflow-hidden">
            <TransactionTable transactions={filteredTransactions} />
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card className="border-none shadow-md rounded-2xl overflow-hidden">
            <ExpenseTable expenses={filteredExpenses} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable Stats Card Component
function StatsCard({ title, value, icon, color, isDark = false }: any) {
  const colors: any = {
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    indigo: isDark
      ? "bg-indigo-600 text-white"
      : "bg-indigo-100 text-indigo-600",
  };

  return (
    <Card
      className={`border-none shadow-sm rounded-2xl p-6 ${isDark ? "bg-indigo-600 text-white" : "bg-white"}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-xl ${isDark ? "bg-white/20" : colors[color]}`}
        >
          {icon}
        </div>
        <div>
          <p
            className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-indigo-100" : "text-slate-500"}`}
          >
            {title}
          </p>
          <h3 className="text-2xl font-black">₱{value.toLocaleString()}</h3>
        </div>
      </div>
    </Card>
  );
}
