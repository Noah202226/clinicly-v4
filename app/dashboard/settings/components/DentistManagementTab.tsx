"use client";

import * as React from "react";
import { AppwriteException, Models } from "appwrite";

// --- Components & Icons ---
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// --- Store & Types ---
// 🚨 NOTE: You must create these files!
import { useDentistStore } from "@/app/store/dentist-store";
import { useBranchStore } from "@/app/store/branch-store";
import { Branch, Dentist } from "@/app/appwrite"; // Assuming you export Branch and Dentist types

// --- Type Definitions ---
interface DentistDocument extends Dentist, Models.Document {}
interface BranchDocument extends Branch, Models.Document {}

interface DentistFormState extends Dentist {
  $id?: string;
  branchId: string; // Dentists are typically assigned to one branch
}

// --- Component ---
export function DentistManagementTab() {
  // 1. DENTIST STORE STATE & ACTIONS
  // 1. DENTIST STORE STATE SELECTION (Use separate hooks for simple state)
  const dentists = useDentistStore((state) => state.dentists);
  const isDentistLoading = useDentistStore((state) => state.isLoading);

  // 2. DENTIST STORE ACTIONS (Get actions using the static getter for stability)
  const { fetchDentists, createDentist, updateDentist, deleteDentist } =
    useDentistStore.getState();

  // 3. BRANCH STORE STATE & ACTIONS (Fetch branches action also via static getter)
  const branches = useBranchStore(
    (state) => state.branches
  ) as BranchDocument[];
  const isBranchLoading = useBranchStore((state) => state.isLoading);
  const fetchBranches = useBranchStore.getState().fetchBranches; // Static getter for the action

  // --- Component State ---
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formState, setFormState] = React.useState<DentistFormState>({
    name: "",
    email: "",
    contact: "",
    branchId: "", // Default to empty string
  });

  // --- Data Fetching Effect ---
  React.useEffect(() => {
    // 1. Fetch Dentists
    if (dentists.length === 0 && !isDentistLoading) {
      fetchDentists();
    }
    // 2. Fetch Branches (if not loaded, needed for the form)
    if (branches.length === 0 && !isBranchLoading) {
      fetchBranches();
    }
  }, [
    fetchDentists,
    dentists.length,
    isDentistLoading,
    fetchBranches,
    branches.length,
    isBranchLoading,
  ]);

  // --- Utility Functions ---

  const resetForm = () => {
    setFormState({
      name: "",
      email: "",
      contact: "",
      branchId: branches[0]?.$id || "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find((b) => b.$id === branchId);
    return branch ? branch.name : "Unknown Branch";
  };

  // --- CRUD Operations ---

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { $id, name, email, contact, branchId } = formState;

    if (!name || !branchId) {
      alert("Dentist name and branch are required.");
      setIsSaving(false);
      return;
    }

    try {
      const dataToSave = { name, email, contact, branchId };

      if ($id) {
        await updateDentist($id, dataToSave);
      } else {
        await createDentist(dataToSave);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving dentist:", error);
      alert("An unexpected error occurred while saving the dentist.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (dentist: DentistDocument) => {
    setFormState({
      $id: dentist.$id,
      name: dentist.name,
      email: dentist.email,
      contact: dentist.contact,
      branchId: dentist.branchId || branches[0]?.$id || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (dentistId: string) => {
    if (!confirm("Are you sure you want to delete this dentist?")) return;
    try {
      await deleteDentist(dentistId);
    } catch (error) {
      console.error("Error deleting dentist:", error);
      alert("An unexpected error occurred while deleting the dentist.");
    }
  };

  // --- Render ---

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>🦷 Dentists</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <IconPlus className="h-4 w-4 mr-2" /> Add New Dentist
        </Button>
      </CardHeader>

      <CardContent>
        <CardDescription className="mb-4">
          Manage your dental professionals, their specialities, and clinic
          assignments.
        </CardDescription>

        {isDentistLoading ? (
          <div className="flex justify-center items-center h-40">
            <IconLoader2 className="h-6 w-6 animate-spin mr-2" /> Loading
            Dentists...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Assigned Branch</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dentists.length > 0 ? (
                dentists.map((dentist) => (
                  <TableRow key={dentist.$id}>
                    <TableCell className="font-medium">
                      {dentist.name}
                    </TableCell>
                    <TableCell>{dentist.email || "General"}</TableCell>
                    <TableCell>{dentist.contact || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getBranchName(dentist.branchId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(dentist as DentistDocument)}
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(dentist.$id)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No dentists defined yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* --- Dentist Management Dialog (Form) --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {formState.$id ? "Edit Dentist" : "Add New Dentist"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formState.name || ""}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            {/* email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                email
              </Label>
              <Input
                id="email"
                name="email"
                value={formState.email || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right">
                Contact
              </Label>
              <Input
                id="contact"
                name="contact"
                value={formState.contact || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            {/* Branch Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="branchId" className="text-right">
                Branch
              </Label>
              <select
                id="branchId"
                name="branchId"
                value={formState.branchId}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    branchId: e.target.value,
                  }))
                }
                className="col-span-3 p-2 border rounded-md"
                required
              >
                {isBranchLoading && <option>Loading branches...</option>}
                {branches.length === 0 && !isBranchLoading ? (
                  <option disabled>No branches available</option>
                ) : (
                  branches.map((branch) => (
                    <option key={branch.$id} value={branch.$id}>
                      {branch.name}
                    </option>
                  ))
                )}
              </select>
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
