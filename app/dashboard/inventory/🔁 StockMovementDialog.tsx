"use client";

import * as React from "react";
import { IconArrowsUpDown } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";

import { useInventoryStore } from "@/app/store/inventory-store";
import { useAuthStore } from "@/app/store/useAuthStore";

interface StockMovementDialogProps {
  item: {
    $id: string;
    name: string;
    quantity: number;
    minStock: number;
    branchId: string;
  };
}

export function StockMovementDialog({ item }: StockMovementDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const updateStock = useInventoryStore((s) => s.updateStock);
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = e.currentTarget;

      const type = (form.type as HTMLInputElement).value as "IN" | "OUT";
      const movementQty = Number((form.quantity as HTMLInputElement).value);
      const reason = (form.reason as HTMLInputElement).value;

      if (movementQty <= 0) {
        throw new Error("Quantity must be greater than 0");
      }
      const newQuantity =
        type === "IN"
          ? item.quantity + movementQty
          : item.quantity - movementQty;

      if (newQuantity < 0) {
        throw new Error("Insufficient stock");
      }

      const isLowStock = newQuantity <= item.minStock;

      console.log(isLowStock);

      await updateStock({
        inventoryId: item.$id,
        type,
        quantity: movementQty,
        reason,
        createdBy: user?.name,
        isLowStock,
        newQuantity, // ← strongly recommended
      });

      toast.success(
        type === "IN"
          ? `Added ${movementQty} to ${item.name}`
          : `Used ${movementQty} from ${item.name}`
      );

      form.reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <IconArrowsUpDown className="mr-2 h-4 w-4" />
          Update Stock
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {item.name} — Current Qty: <strong>{item.quantity}</strong>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TYPE */}
          <div className="space-y-2">
            <Label>Action</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">➕ Stock In</SelectItem>
                <SelectItem value="OUT">➖ Stock Out (Used)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* QUANTITY */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              name="quantity"
              type="number"
              min={1}
              placeholder="Enter quantity"
              required
            />
          </div>

          {/* REASON */}
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Input
              name="reason"
              placeholder="Procedure, damaged, purchased, etc."
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
