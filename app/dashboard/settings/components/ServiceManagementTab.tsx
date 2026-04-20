"use client";

import * as React from "react";
import { Models, AppwriteException } from "appwrite";

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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// --- Store & Types ---
import { useServiceStore } from "@/app/store/service-store";
import { Service } from "@/app/dashboard/settings/types/Service";
import { useBranchStore } from "@/app/store/branch-store";

// --- Type Definitions ---
interface ServiceDocument extends Service, Models.Document {}

interface ServiceFormState extends Service {
  $id?: string;
}

// --- Component ---
export function ServiceManagementTab() {
  // 🎯 CONNECT TO ZUSTAND STORE
  const services = useServiceStore((state) => state.services);
  const isServiceLoading = useServiceStore((state) => state.isLoading);

  // 🎯 ALTERNATIVE: Select actions one by one
  const fetchServices = useServiceStore((state) => state.fetchServices);

  // Branch Store (State)
  const branches = useBranchStore((state) => state.branches);
  const isBranchLoading = useBranchStore((state) => state.isLoading);

  // 🎯 FIX: Retrieve fetchBranches using the hook
  const fetchBranches = useBranchStore((state) => state.fetchBranches);

  // All other actions needed in other parts of the component should be retrieved this way too:
  const createService = useServiceStore((state) => state.createService);
  const updateService = useServiceStore((state) => state.updateService);
  const deleteService = useServiceStore((state) => state.deleteService);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formState, setFormState] = React.useState<ServiceFormState>({
    name: "",
    description: "",
    price: 0,
    duration: 30,
    branchIds: [],
  });

  // --- Utility Functions ---

  const resetForm = () => {
    setFormState({
      name: "",
      description: "",
      price: 0,
      duration: 30,
      branchIds: [],
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]:
        type === "number" || name === "price" || name === "duration"
          ? +value
          : value,
    }));
  };

  // Helper to map branch IDs to names
  const getBranchNames = (ids: string[]): string[] => {
    return ids
      .map((id) => {
        const branch = branches.find((b) => b.$id === id);
        return branch ? branch.name : "Unknown";
      })
      .filter((name) => name !== "Unknown");
  };

  // --- Data Fetching ---

  React.useEffect(() => {
    // 1. Fetch Services
    if (services.length === 0 && !isServiceLoading) {
      fetchServices();
    }

    // 2. Fetch Branches
    if (branches.length === 0 && !isBranchLoading) {
      fetchBranches();
    }
  }, [
    fetchServices,
    services.length,
    isServiceLoading,
    fetchBranches, // Now a stable dependency
    branches.length,
    isBranchLoading,
  ]);

  // --- CRUD Operations ---

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Destructure all necessary fields, including branchIds
    const { $id, name, description, price, duration, branchIds } = formState;

    if (!name || !description || price <= 0 || duration <= 0) {
      alert(
        "Please ensure service name, description, price, and duration are valid."
      );
      setIsSaving(false);
      return;
    }

    try {
      // Create dataToSave using the branchIds from the formState
      const dataToSave = {
        name,
        description,
        price,
        duration,
        branchIds: branchIds, // THIS IS CORRECTLY PASSING THE ARRAY NOW
      };

      if ($id) {
        await updateService($id, dataToSave);
      } else {
        await createService(dataToSave);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      if (error instanceof AppwriteException) {
        alert(
          `Appwrite Error: ${error.message}. Check your collection's permissions.`
        );
      } else {
        console.error("Error saving service:", error);
        alert("An unexpected error occurred while saving.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (service: ServiceDocument) => {
    setFormState({
      $id: service.$id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      // Ensure branchIds is an array, even if Appwrite returned null/undefined
      branchIds: service.branchIds || [],
    });
    setIsDialogOpen(true);
  };

  // ... (handleDelete remains the same)

  const handleDelete = async (serviceId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this service? This cannot be undone."
      )
    )
      return;

    try {
      await deleteService(serviceId);
    } catch (error) {
      if (error instanceof AppwriteException) {
        alert(
          `Appwrite Error: ${error.message}. Check your collection's permissions.`
        );
      } else {
        console.error("Error deleting service:", error);
      }
    }
  };

  const handleBranchSelect = (branchId: string, checked: boolean) => {
    setFormState((prev) => {
      const currentIds = prev.branchIds || [];
      if (checked) {
        // Add the ID if it's not already there
        return { ...prev, branchIds: [...currentIds, branchId] };
      } else {
        // Remove the ID
        return {
          ...prev,
          branchIds: currentIds.filter((id) => id !== branchId),
        };
      }
    });
  };

  // --- Render ---

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>💎 Services Catalog</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <IconPlus className="h-4 w-4 mr-2" /> Add New Service
        </Button>
      </CardHeader>

      <CardContent>
        <CardDescription className="mb-4">
          Define the services offered, their price, and duration across your
          clinics.
        </CardDescription>

        {isServiceLoading ? (
          <div className="flex justify-center items-center h-40">
            <IconLoader2 className="h-6 w-6 animate-spin mr-2" /> Loading
            Services...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Service Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Branches</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length > 0 ? (
                services.map((service) => (
                  <TableRow key={service.$id}>
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {service.description}
                    </TableCell>
                    <TableCell className="font-mono">
                      {service.price || "0.00"}
                    </TableCell>
                    <TableCell>{service.duration} min</TableCell>
                    <TableCell>
                      {/* 🎯 FIX: Display branch names instead of just the count */}
                      {service.branchIds && service.branchIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {getBranchNames(service.branchIds).map((name) => (
                            <Badge
                              key={name}
                              variant="secondary"
                              className="text-xs"
                            >
                              {name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          None
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service as ServiceDocument)}
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(service.$id)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No services defined yet. Click "Add New Service" to get
                    started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* --- Service Management Dialog (Form) --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[740px]">
          <DialogHeader>
            <DialogTitle>
              {formState.$id ? "Edit Service" : "Add New Service"}
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
                value={formState.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleChange}
                className="col-span-3 resize-none"
                rows={3}
                required
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                // Assuming price is stored in CENTS in Appwrite (integer)
                min={0}
                step={1} // Price is integer in DB (e.g., $10.00 is stored as 1000)
                value={formState.price}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Duration */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (min)
              </Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={formState.duration}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            {/* 🎯 NEW: Branch Selection - Updated for Mobile Responsiveness */}
            <div className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-4">
              <Label
                htmlFor="branchSelection"
                className="sm:text-right mt-2 w-full sm:w-auto"
              >
                Available at
              </Label>

              <div className="col-span-3 w-full flex flex-wrap gap-x-4 gap-y-2">
                {isBranchLoading ? (
                  <p className="text-sm text-muted-foreground">
                    <IconLoader2 className="h-4 w-4 inline mr-2 animate-spin" />{" "}
                    Loading branches...
                  </p>
                ) : branches.length === 0 ? (
                  <p className="text-sm text-red-500">
                    No branches defined. Check Branch Management.
                  </p>
                ) : (
                  branches.map((branch) => (
                    <div
                      key={branch.$id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`branch-${branch.$id}`}
                        checked={
                          formState.branchIds?.includes(branch.$id) || false
                        }
                        onChange={(e) =>
                          handleBranchSelect(branch.$id, e.target.checked)
                        }
                        className="h-4 w-4 text-primary rounded border-gray-300"
                      />
                      <Label
                        htmlFor={`branch-${branch.$id}`}
                        className="font-normal"
                      >
                        {branch.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* 🎯 END NEW: Branch Selection */}

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
