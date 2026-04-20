"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServiceCategoryStore } from "@/app/store/service-category-store";
import { toast } from "sonner"; // Ensure you have sonner installed

export function ServiceCategoryTab() {
  const {
    categories,
    loading,
    fetchAllCategories,
    addCategory,
    deleteCategory,
  } = useServiceCategoryStore();

  const [newCategory, setNewCategory] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;

    const promise = addCategory(newCategory.trim());

    toast.promise(promise, {
      loading: "Adding category...",
      success: "Category added successfully",
      error: "Failed to add category",
    });

    await promise;
    setNewCategory("");
  };

  const handleDelete = async (id: string, name: string) => {
    // We set a local deleting state for the specific row
    setDeletingId(id);

    const promise = deleteCategory(id);

    toast.promise(promise, {
      loading: `Deleting ${name}...`,
      success: "Category deleted",
      error: "Could not delete category",
    });

    try {
      await promise;
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="size-5 text-blue-500" />
            Service Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="e.g. Periodontics"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              disabled={loading}
            />
            <Button
              onClick={handleAdd}
              disabled={loading || !newCategory.trim()}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Plus className="size-4 mr-2" />
              )}
              Add
            </Button>
          </div>

          <div className="rounded-md border bg-white">
            {loading && categories.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-blue-500" />
                <p className="text-xs text-muted-foreground">
                  Loading categories...
                </p>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No categories found. Add one above.
              </div>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {categories.map((cat) => (
                    <tr
                      key={cat.$id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-3 font-medium text-slate-700">
                        {cat.name}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          onClick={() => handleDelete(cat.$id, cat.name)}
                          disabled={deletingId === cat.$id}
                        >
                          {deletingId === cat.$id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
