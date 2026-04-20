"use client";

import * as React from "react";
import {
  IconCash,
  IconPlus,
  IconTrash,
  IconFilter,
  IconCalendar,
  IconCategory,
  IconReceipt2,
  IconChevronRight,
} from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { useExpenseStore } from "@/app/store/expense-store";
import { useBranchStore } from "@/app/store/branch-store";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useExpenseCategoryStore } from "@/app/store/expense-category-store";

/* =========================
   ADD EXPENSE DIALOG
========================= */
function AddExpenseDialog() {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const addExpense = useExpenseStore((s) => s.addExpense);
  const { fetchExpenses } = useExpenseStore();
  const { currentBranchId } = useBranchStore();
  const { user } = useAuthStore();
  const { categories, fetchCategories } = useExpenseCategoryStore();

  React.useEffect(() => {
    if (open) fetchCategories();
  }, [open, fetchCategories]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);

      await addExpense({
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        amount: Number(formData.get("amount")),
        date: formData.get("date") as string,
        branchId: currentBranchId ?? "",
        createdBy: user?.name,
      });

      toast.success("Expense added successfully");
      fetchExpenses({ branchId: currentBranchId || "" });
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all active:scale-95">
          <IconPlus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            New Expense
          </DialogTitle>
          <p className="text-sm text-slate-500 text-left">
            Record a new clinic expenditure.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Description</Label>
            <Input
              name="description"
              placeholder="e.g. Dental Supplies - Batch A"
              required
              className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Category</Label>
              <Select name="category" required>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="p-4 text-xs text-center text-muted-foreground">
                      No categories found.
                    </div>
                  ) : (
                    categories.map((c) => (
                      <SelectItem key={c.$id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                  ₱
                </span>
                <Input
                  name="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  className="pl-7 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">
              Transaction Date
            </Label>
            <Input
              name="date"
              type="date"
              defaultValue={format(new Date(), "yyyy-MM-dd")}
              required
              className="bg-slate-50 border-slate-200"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? "Processing..." : "Confirm & Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* =========================
   EXPENSES PAGE
========================= */
export default function ExpensesPage() {
  const { currentBranchId } = useBranchStore();
  const { expenses, loading, fetchExpenses, deleteExpense } = useExpenseStore();

  const [category, setCategory] = React.useState<string>("all");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");

  React.useEffect(() => {
    if (currentBranchId) {
      fetchExpenses({
        branchId: currentBranchId,
        category: category !== "all" ? category : undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
    }
  }, [fetchExpenses, currentBranchId, category, fromDate, toDate]);

  const totalExpenses = React.useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  const handleDelete = async (id: string) => {
    toast.custom(
      (t) => (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 max-w-sm w-full animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-3 text-red-600">
            <div className="bg-red-50 p-2 rounded-full">
              <Trash2 className="size-5" />
            </div>
            <h3 className="font-bold text-lg">Remove Expense?</h3>
          </div>
          <p className="text-sm text-slate-500">
            This action cannot be undone. This record will be permanently
            deleted from the branch logs.
          </p>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="ghost" size="sm" onClick={() => toast.dismiss(t)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                toast.dismiss(t);
                try {
                  await deleteExpense(id);
                  toast.success("Expense removed");
                } catch (err) {
                  toast.error("Error deleting expense");
                }
              }}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" },
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-10 bg-[#fafafa] min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Expenses
          </h2>
          <p className="text-muted-foreground">
            Track and manage your clinic expenditures and cash flow.
          </p>
        </div>
        <AddExpenseDialog />
      </div>

      {/* SUMMARY DASHBOARD */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative">
          <IconCash className="absolute -right-4 -bottom-4 size-24 text-white/10" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-indigo-100">
              Total Outflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₱
              {totalExpenses.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              For the selected period
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Transactions
            </CardTitle>
            <IconReceipt2 className="size-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {expenses.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total expense records</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Avg. per Expense
            </CardTitle>
            <IconCash className="size-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              ₱
              {expenses.length > 0
                ? (totalExpenses / expenses.length).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Average cost per entry
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS AREA */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 text-slate-500 mr-2">
          <IconFilter size={18} />
          <span className="text-sm font-medium">Filters</span>
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px] bg-slate-50 border-none h-9 text-xs">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {[...new Set(expenses.map((i) => i.category))].map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-[150px] bg-slate-50 border-none h-9 text-xs"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className="text-slate-300">→</span>
          <Input
            type="date"
            className="w-[150px] bg-slate-50 border-none h-9 text-xs"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        {(category !== "all" || fromDate || toDate) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 hover:text-red-500 h-9"
            onClick={() => {
              setCategory("all");
              setFromDate("");
              setToDate("");
            }}
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* MAIN TABLE */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-semibold text-slate-700">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Description
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Category
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700">
                  Amount
                </TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="py-8">
                      <div className="h-4 w-full bg-slate-100 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                      <IconReceipt2 size={48} stroke={1} />
                      <p>No expense records found.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCategory("all")}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((e) => (
                  <TableRow
                    key={e.$id}
                    className="group border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="text-slate-600 font-medium">
                      {format(parseISO(e.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">
                          {e.description}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                          By {e.createdBy || "Admin"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-normal border-none"
                      >
                        {e.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      ₱
                      {e.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all"
                        onClick={() => handleDelete(e.$id)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
