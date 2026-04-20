// app/dashboard/settings/components/ExpenseCategoryTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExpenseCategoryStore } from "@/app/store/expense-category-store";
import { toast } from "sonner";

export function ExpenseCategoryTab() {
  const [newCategory, setNewCategory] = useState("");
  const { categories, loading, fetchCategories, addCategory, deleteCategory } =
    useExpenseCategoryStore();

  // Fetch categories when the component mounts
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    const success = await addCategory(newCategory.trim());
    if (success) {
      toast.success("Category added successfully");
      setNewCategory(""); // Clear input
    } else {
      toast.error("Failed to add category");
    }
  };

  const handleDelete = (id: string) => {
    toast.custom(
      (t) => (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 max-w-sm w-full animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-3 text-red-600">
            <div className="bg-red-50 p-2 rounded-full">
              <Trash2 className="size-5" />
            </div>
            <h3 className="font-bold text-lg">Confirm Delete</h3>
          </div>

          <p className="text-sm text-slate-500">
            Are you sure you want to delete this category? This will affect your
            expense reports.
          </p>

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="ghost" size="sm" onClick={() => toast.dismiss(t)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                toast.dismiss(t); // Close the confirm toast
                const success = await deleteCategory(id);
                if (success) {
                  toast.success("Category removed");
                } else {
                  toast.error("Error deleting category");
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Keep it open until they choose
        position: "top-center", // This overrides the default corner position for this specific toast
      },
    );
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>
                Define the types of expenses your clinic records for financial
                tracking.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="e.g. Laboratory Fees"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              className="max-w-sm"
              disabled={loading}
            />
            <Button
              onClick={handleAddCategory}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Plus className="size-4 mr-2" />
              )}
              Add Category
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground py-8"
                    >
                      {loading
                        ? "Loading categories..."
                        : "No expense categories found. Add one above."}
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.$id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Tag className="size-4 text-slate-400" />
                        {cat.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cat.$id)}
                          disabled={loading}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
