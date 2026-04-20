"use client";

import * as React from "react";
import {
  IconPackage,
  IconPencil,
  IconTrash,
  IconAlertTriangle,
  IconArchive,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventoryStore } from "@/app/store/inventory-store";
import { useBranchStore } from "@/app/store/branch-store";
import { toast } from "sonner";
import { StockMovementDialog } from "./🔁 StockMovementDialog";

// I-adjust ang imports base sa actual folder structure mo
import { AddProductDialog } from "./components/AddProductDialog";
import { LowStockModal } from "./components/LowStockModal";

/* =========================
   INVENTORY PAGE
========================= */
export default function InventoryPage() {
  const { currentBranchId } = useBranchStore();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const {
    items,
    loading,
    lowStockItems,
    deleteProduct,
    fetchInventoryByBranch,
  } = useInventoryStore();

  React.useEffect(() => {
    if (currentBranchId) {
      fetchInventoryByBranch(currentBranchId);
    }
  }, [fetchInventoryByBranch, currentBranchId]);

  // Derived State
  const outOfStockItems = items.filter((p) => p.quantity === 0);
  const lowStockCount = lowStockItems().length;

  const filteredItems = items.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const isLow = p.quantity <= p.minStock && p.quantity > 0;
    const isOut = p.quantity === 0;

    if (filterStatus === "low") return matchesSearch && isLow;
    if (filterStatus === "out") return matchesSearch && isOut;
    return matchesSearch;
  });

  const executeDelete = async (id: string, name: string) => {
    const loadingToast = toast.loading(`Deleting ${name}...`);
    try {
      await deleteProduct(id);
      toast.success(`${name} has been removed from inventory.`, {
        id: loadingToast,
      });
    } catch (error) {
      toast.error("Failed to delete product. Please try again.", {
        id: loadingToast,
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    toast.error(`Delete ${name}?`, {
      description: "This will permanently remove the item and its history.",
      duration: 5000,
      action: {
        label: "Delete Now",
        onClick: () => executeDelete(id, name),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  function EditableThreshold({
    id,
    currentMin,
  }: {
    id: string;
    currentMin: number;
  }) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [value, setValue] = React.useState(currentMin);
    const updateMinStock = useInventoryStore((s) => s.updateMinStock);

    const handleSave = async () => {
      try {
        await updateMinStock(id, value);
        toast.success("Threshold updated");
        setIsEditing(false);
      } catch (error) {
        toast.error("Update failed");
      }
    };

    if (isEditing) {
      return (
        <div className="flex items-center justify-end gap-1">
          <Input
            type="number"
            className="w-16 h-7 text-xs text-right"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            autoFocus
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-green-600 bg-green-50 hover:bg-green-100"
            onClick={handleSave}
          >
            ✓
          </Button>
        </div>
      );
    }

    return (
      <div
        className="cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-md transition-colors group flex items-center justify-end gap-2 border border-transparent hover:border-slate-200"
        onClick={() => setIsEditing(true)}
      >
        <span className="font-medium text-slate-700">{currentMin}</span>
        <IconPencil className="size-3 text-slate-400 group-hover:text-slate-700" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Inventory Management
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Monitor stocks and track supply movements.
          </p>
        </div>
        <AddProductDialog />
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Products Card */}
        <Card
          onClick={() =>
            setFilterStatus(filterStatus === "all" ? "all" : "all")
          }
          className={`relative overflow-hidden border-none shadow-sm bg-linear-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg hover:brightness-110 transition-all active:scale-[0.98] group ${filterStatus === "all" ? "ring-2 ring-amber-400 ring-offset-2" : ""}`}
        >
          <IconArchive className="absolute -right-6 -bottom-6 size-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="text-indigo-100 font-medium">
                Total Products
              </CardDescription>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <IconPackage className="size-5" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black">
              {items.length}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex justify-between items-center text-amber-100 text-xs font-medium">
            <span> Active items in database</span>
            <span className="bg-white/20 px-2 py-1 rounded-md font-bold uppercase tracking-tighter">
              {filterStatus === "all" ? "Filtering..." : "Filter"}
            </span>
          </CardFooter>
        </Card>

        {/* Low Stock Card */}
        <Card
          onClick={() =>
            setFilterStatus(filterStatus === "low" ? "all" : "low")
          }
          className={`relative overflow-hidden border-none shadow-sm bg-linear-to-br from-amber-500 to-amber-600 text-white cursor-pointer hover:shadow-lg hover:brightness-110 transition-all active:scale-[0.98] group ${filterStatus === "low" ? "ring-2 ring-amber-400 ring-offset-2" : ""}`}
        >
          <IconAlertTriangle className="absolute -right-6 -bottom-6 size-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="text-amber-100 font-medium">
                Low Stock Alerts
              </CardDescription>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm animate-pulse">
                <IconAlertTriangle className="size-5" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black">
              {lowStockCount}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex justify-between items-center text-amber-100 text-xs font-medium">
            <span>Items below minimum threshold</span>
            <span className="bg-white/20 px-2 py-1 rounded-md font-bold uppercase tracking-tighter">
              {filterStatus === "low" ? "Filtering..." : "Filter"}
            </span>
          </CardFooter>
        </Card>

        {/* Out of Stock Card */}
        <Card
          onClick={() =>
            setFilterStatus(filterStatus === "out" ? "all" : "out")
          }
          className={`relative overflow-hidden border-none shadow-sm bg-linear-to-br from-red-500 to-red-600 text-white cursor-pointer hover:shadow-lg hover:brightness-110 transition-all active:scale-[0.98] group ${filterStatus === "out" ? "ring-2 ring-red-400 ring-offset-2" : ""}`}
        >
          <IconPackage className="absolute -right-6 -bottom-6 size-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="text-red-100 font-medium">
                Out of Stock
              </CardDescription>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <IconAlertTriangle className="size-5" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black">
              {outOfStockItems.length}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex justify-between items-center text-red-100 text-xs font-medium">
            <span>Zero quantity remaining</span>
            <span className="bg-white/20 px-2 py-1 rounded-md font-bold uppercase tracking-tighter">
              {filterStatus === "out" ? "Filtering..." : "Filter"}
            </span>
          </CardFooter>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-96">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search products..."
            className="pl-10 bg-white border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <IconFilter className="size-4 text-slate-500" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-white border-slate-200">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          {(searchTerm || filterStatus !== "all") && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
              className="text-slate-500 hover:text-slate-900"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-white border-b border-slate-100 px-6 py-5">
          <CardTitle className="text-lg font-bold text-slate-800">
            Inventory Items{" "}
            {filterStatus !== "all" && (
              <Badge className="ml-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-50 border-none capitalize">
                {filterStatus} Only
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-600 h-12 px-6">
                  Product Name
                </TableHead>
                <TableHead className="font-bold text-slate-600">
                  Category
                </TableHead>
                <TableHead className="font-bold text-slate-600">
                  Status
                </TableHead>
                <TableHead className="text-right font-bold text-slate-600">
                  Current Qty
                </TableHead>
                <TableHead className="text-right font-bold text-slate-600">
                  Min Stock
                </TableHead>
                <TableHead className="text-right font-bold text-slate-600 px-6 w-[120px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-16 text-slate-500 font-medium"
                  >
                    Loading inventory data...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-16 text-slate-400 font-medium"
                  >
                    {searchTerm || filterStatus !== "all"
                      ? "No products match your filters."
                      : "No inventory items found. Click 'Add New Product' to start."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((p) => {
                  const isLowStock = p.quantity <= p.minStock;
                  const isOutOfStock = p.quantity === 0;

                  return (
                    <TableRow
                      key={p.$id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <TableCell className="font-bold text-slate-900 px-6">
                        {p.name}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          {p.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isOutOfStock ? (
                          <Badge
                            variant="destructive"
                            className="bg-red-100 text-red-700 hover:bg-red-100 border-none font-black text-[10px] uppercase"
                          >
                            Out of Stock
                          </Badge>
                        ) : isLowStock ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-700 border-amber-200 font-black text-[10px] uppercase"
                          >
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-700 border-green-200 font-black text-[10px] uppercase"
                          >
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-black ${isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-slate-700"}`}
                      >
                        {p.quantity}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <EditableThreshold id={p.$id} currentMin={p.minStock} />
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-1">
                          {p.branchId && (
                            <StockMovementDialog item={p as any} />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors h-8 w-8"
                            onClick={() => handleDelete(p.$id, p.name)}
                            title="Delete Product"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
