"use client";

import * as React from "react";
import { IconPackage, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
import { useInventoryStore } from "@/app/store/inventory-store";
import { useBranchStore } from "@/app/store/branch-store";
import { useAuthStore } from "@/app/store/useAuthStore";
import { toast } from "sonner";
import { useInventoryCategoryStore } from "@/app/store/inventory-category-store";

export function AddProductDialog() {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const { categories, fetchCategories } = useInventoryCategoryStore();

  React.useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open, fetchCategories]);

  const addProduct = useInventoryStore((s) => s.addProduct);
  const { currentBranchId } = useBranchStore();
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = e.currentTarget;
      const data = {
        name: (form.productName as HTMLInputElement).value,
        category: (form.category as any).value,
        quantity: Number((form.quantity as HTMLInputElement).value),
        minStock: Number((form.minStock as HTMLInputElement).value),
        branchId: currentBranchId ?? "",
        createdBy: user?.name,
        isLowStock: false,
      };

      await addProduct(data);

      toast.success(`Product added successfully.`);
      setOpen(false);
      form.reset();
    } catch (e: any) {
      toast.error(e.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-xl transition-all active:scale-95">
          <IconPlus className="mr-2 h-5 w-5" />
          Add New Product
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl overflow-hidden p-0">
        <div className="bg-indigo-600 p-6 text-white relative">
          <IconPackage className="absolute right-4 bottom-2 size-24 opacity-20 rotate-12" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <IconPackage className="size-6" />
              New Item
            </DialogTitle>
            <p className="text-indigo-100 text-sm font-medium mt-1">
              Add a new product to your inventory branch.
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-white space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-600 font-bold text-xs uppercase">
                Product Name
              </Label>
              <Input
                name="productName"
                placeholder="e.g. Lidocaine 2%"
                className="rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-600 font-bold text-xs uppercase">
                Category
              </Label>
              <Select name="category" required>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="p-2 text-xs text-center text-slate-400">
                      No categories found. Add one in settings.
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.$id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-600 font-bold text-xs uppercase">
                  Initial Qty
                </Label>
                <Input
                  name="quantity"
                  type="number"
                  min={0}
                  defaultValue={100}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 font-bold text-xs uppercase">
                  Min. Stock
                </Label>
                <Input
                  name="minStock"
                  type="number"
                  min={0}
                  defaultValue={10}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11"
            >
              {saving ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
