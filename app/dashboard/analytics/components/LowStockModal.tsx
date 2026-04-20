"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Package } from "lucide-react";
import { useInventoryStore } from "@/app/store/inventory-store"; // adjust path
import { useEffect } from "react";
import { useBranchStore } from "@/app/store/branch-store";

export function LowStockModal({ children }: { children: React.ReactNode }) {
  const { currentBranchId } = useBranchStore();
  const { items, fetchInventoryByBranch } = useInventoryStore();

  useEffect(() => {
    fetchInventoryByBranch(currentBranchId || "");
  }, [fetchInventoryByBranch, currentBranchId]);

  // Use the same logic as your store to stay consistent
  const lowStockList = items.filter((i) => i.quantity <= i.minStock);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="text-destructive size-5" />
            Low Stock Inventory
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
          {lowStockList.length > 0 ? (
            lowStockList.map((item) => (
              <div
                key={item.$id}
                className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">
                    {item.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {item.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-destructive">
                    {item.quantity} left
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Min: {item.minStock}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Package className="size-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                All stock levels are healthy!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
