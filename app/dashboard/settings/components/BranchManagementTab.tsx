"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconLoader2,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AppwriteException, Models } from "appwrite";

import { useBranchStore } from "@/app/store/branch-store";
import { Branch } from "@/app/appwrite";

interface BranchDocument extends Branch, Models.Document {}

interface BranchFormState extends Omit<Branch, "$id"> {
  $id?: string;
}

/**
 * Helper to convert 24h integer to AM/PM string
 * e.g., 9 -> "9:00 AM", 13 -> "1:00 PM"
 */
const formatHour = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${period}`;
};

// Generate array of hours 0-23
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(),
  label: formatHour(i),
}));

export function BranchManagementTab() {
  const branches = useBranchStore((state) => state.branches);
  const isLoading = useBranchStore((state) => state.isLoading);

  const { fetchBranches, createBranch, updateBranch, deleteBranch } =
    useBranchStore.getState();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formState, setFormState] = React.useState<BranchFormState>({
    name: "",
    address: "",
    startHour: 9,
    endHour: 18,
  });

  const resetForm = () => {
    setFormState({ name: "", address: "", startHour: 9, endHour: 18 });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleHourChange = (name: "startHour" | "endHour", value: string) => {
    setFormState((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  React.useEffect(() => {
    if (branches.length === 0 && !isLoading) {
      fetchBranches();
    }
  }, [fetchBranches, branches.length, isLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { $id, name, address, startHour, endHour } = formState;

    if (!name || !address || startHour >= endHour) {
      alert("Ensure all fields are valid and Start Hour is before End Hour.");
      setIsSaving(false);
      return;
    }

    try {
      const dataToSave = { name, address, startHour, endHour };
      if ($id) {
        await updateBranch($id, dataToSave);
      } else {
        await createBranch(dataToSave);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      const msg =
        error instanceof AppwriteException ? error.message : "Error saving";
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (branch: BranchDocument) => {
    setFormState({
      $id: branch.$id,
      name: branch.name,
      address: branch.address,
      startHour: branch.startHour,
      endHour: branch.endHour,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (branchId: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    try {
      await deleteBranch(branchId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>📍 Clinic Branches</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <IconPlus className="h-4 w-4 mr-2" /> Add New Branch
        </Button>
      </CardHeader>

      <CardContent>
        <CardDescription className="mb-4">
          Manage the physical locations and operating hours of your clinics.
        </CardDescription>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <IconLoader2 className="h-6 w-6 animate-spin mr-2" /> Loading
            Branches...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.length > 0 ? (
                branches.map((branch) => (
                  <TableRow key={branch.$id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.address}</TableCell>
                    <TableCell>
                      {formatHour(branch.startHour)} -{" "}
                      {formatHour(branch.endHour)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(branch as BranchDocument)}
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(branch.$id)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No branches found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {formState.$id ? "Edit Branch" : "Add New Branch"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleTextChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formState.address}
                onChange={handleTextChange}
                className="col-span-3"
                required
              />
            </div>

            {/* START HOUR SELECT */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Start Hour</Label>
              <div className="col-span-3">
                <Select
                  value={formState.startHour.toString()}
                  onValueChange={(val) => handleHourChange("startHour", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Opening time" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUR_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* END HOUR SELECT */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">End Hour</Label>
              <div className="col-span-3">
                <Select
                  value={formState.endHour.toString()}
                  onValueChange={(val) => handleHourChange("endHour", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Closing time" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUR_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
