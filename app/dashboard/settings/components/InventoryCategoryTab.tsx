"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useInventoryCategoryStore } from "@/app/store/inventory-category-store";

export function InventoryCategoryTab() {
  const [newCategory, setNewCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const { categories, loading, fetchCategories, addCategory, deleteCategory } =
    useInventoryCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsSubmitting(true);
    try {
      await addCategory(newCategory.trim());
      toast.success("Category Added", {
        description: `${newCategory} is now available.`,
      });
      setNewCategory("");
    } catch (error: any) {
      toast.error("Failed to add category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async (id: string, name: string) => {
    setIsDeletingId(id);
    try {
      await deleteCategory(id);
      toast.success("Deleted", { description: `${name} has been removed.` });
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setIsDeletingId(null);
    }
  };

  const confirmDelete = (id: string, name: string) => {
    toast("Delete Category", {
      description: `Are you sure you want to delete "${name}"?`,
      action: {
        label: "Delete",
        onClick: () => executeDelete(id, name),
      },
    });
  };

  return (
    <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
            <Layers className="size-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-black text-slate-800">
              Inventory Categories
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium mt-1">
              Manage classification tags for your supplies.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form
            onSubmit={handleAddCategory}
            className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4"
          >
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500 ml-1">
                Category Name
              </Label>
              <Input
                placeholder="e.g. Consumables"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-white border-slate-200 rounded-xl"
                disabled={isSubmitting}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Plus className="size-4 mr-2" />
              )}
              Add Category
            </Button>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="size-8 animate-spin mx-auto text-slate-300" />
              </div>
            ) : categories.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium italic">
                No categories found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <div
                    key={cat.$id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 group transition-all"
                  >
                    <span className="font-bold text-slate-700">{cat.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDelete(cat.$id, cat.name)}
                      disabled={isDeletingId === cat.$id}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      {isDeletingId === cat.$id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
