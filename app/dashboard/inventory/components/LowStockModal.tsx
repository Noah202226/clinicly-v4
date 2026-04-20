"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  IconAlertTriangle,
  IconPackage,
  IconCircleX,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useDashboardStore } from "@/app/dashboard/dashboard-store";
import Link from "next/link";

export function LowStockModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // 1. Pull data from the Dashboard Store
  const { lowStockCount, outOfStockCount, lowStockList, outOfStockList } =
    useDashboardStore();

  const hasOutOfStock = outOfStockCount > 0;
  const totalAlerts = lowStockCount + outOfStockCount;

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          {/* DYNAMIC HEADER: Red if anything is out of stock, otherwise Amber */}
          <div
            className={`${hasOutOfStock ? "bg-red-600" : "bg-amber-500"} p-6 text-white relative transition-colors duration-300`}
          >
            {hasOutOfStock ? (
              <IconCircleX className="absolute right-4 bottom-2 size-24 opacity-20 rotate-12" />
            ) : (
              <IconAlertTriangle className="absolute right-4 bottom-2 size-24 opacity-20 rotate-12" />
            )}

            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-black flex items-center gap-2">
                    {hasOutOfStock ? (
                      <IconAlertCircle className="size-7" />
                    ) : (
                      <IconAlertTriangle className="size-7" />
                    )}
                    Inventory Alert
                  </DialogTitle>
                  <DialogDescription
                    className={`${hasOutOfStock ? "text-red-100" : "text-amber-100"} font-medium mt-1`}
                  >
                    {totalAlerts} items require your attention.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar bg-white">
            {totalAlerts === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium flex flex-col items-center">
                <IconPackage className="size-12 text-slate-200 mb-2" />
                All stock levels are healthy!
              </div>
            ) : (
              <>
                {/* SECTION: OUT OF STOCK (CRITICAL) */}
                {outOfStockList.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.15em] ml-2">
                      Critical: Out of Stock
                    </h3>
                    {outOfStockList.map((item) => (
                      <InventoryItemCard
                        key={item.$id}
                        item={item}
                        type="out"
                      />
                    ))}
                  </div>
                )}

                {/* SECTION: LOW STOCK (WARNING) */}
                {lowStockList.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.15em] ml-2">
                      Warning: Low Stock
                    </h3>
                    {lowStockList.map((item) => (
                      <InventoryItemCard
                        key={item.$id}
                        item={item}
                        type="low"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ACTION FOOTER */}
          <div className="p-4 bg-slate-50 border-t flex justify-center">
            <Link
              href="/dashboard/inventory"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
            >
              Go to Inventory Management →
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Sub-component for individual items to keep the code clean
function InventoryItemCard({ item, type }: { item: any; type: "out" | "low" }) {
  const isOut = type === "out";

  return (
    <Link href={"/dashboard/inventory"}>
      <div
        className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${
          isOut
            ? "bg-red-50/50 border-red-100 hover:border-red-300"
            : "bg-slate-50 border-slate-100 hover:border-amber-200 hover:bg-amber-50/30"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`size-10 rounded-xl bg-white border flex items-center justify-center shadow-sm transition-colors ${
              isOut
                ? "text-red-500 border-red-100"
                : "text-amber-500 border-slate-200 group-hover:border-amber-200"
            }`}
          >
            {isOut ? (
              <IconCircleX className="size-5" />
            ) : (
              <IconPackage className="size-5" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 leading-none truncate max-w-[150px]">
              {item.name}
            </h4>
            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">
              {item.category}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`font-black text-lg ${isOut ? "text-red-600" : "text-amber-600"}`}
          >
            {item.quantity}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            Target: {item.minStock}
          </div>
        </div>
      </div>
    </Link>
  );
}
