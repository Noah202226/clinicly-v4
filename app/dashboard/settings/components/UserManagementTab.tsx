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
  IconUsers,
  IconPencil,
  IconTrash,
  IconShieldLock,
  IconAlertCircle,
  IconDatabase,
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
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

import { useUserStore } from "@/app/store/user-stores";
import { useBranchStore } from "@/app/store/branch-store";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { DATABASE_ID, databases } from "@/app/appwrite";

const CORE_PERMISSIONS = [
  { id: "read", label: "Read Database" },
  { id: "write", label: "Write Database" },
];

const APP_SECTIONS = [
  { id: "access_dashboard", label: "Dashboard" },
  { id: "access_appointments", label: "Appointments" },
  { id: "access_patients", label: "Patient Records" },
  { id: "access_inventory", label: "Inventory" },
  { id: "access_expenses", label: "Expenses" },
  { id: "access_sales_reports", label: "Sales Reports" },
  { id: "access_settings", label: "Settings" },
  { id: "access_reminders", label: "Team Reminders" },
];

export function UserManagementTab() {
  const users = useUserStore((state) => state.users);
  const isLoading = useUserStore((state) => state.isLoading);
  const currentUser = useUserStore((state) => state.currentUser);
  const { fetchUsers, updateUser, deleteUser } = useUserStore();
  const { branches } = useBranchStore();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<any>(null);

  const [formState, setFormState] = React.useState({
    $id: "",
    name: "",
    email: "",
    role: "user",
    isActive: true,
    permissions: [] as string[],
    branchIds: [] as string[],
  });

  React.useEffect(() => {
    if (users.length === 0 && !isLoading) fetchUsers();
  }, [fetchUsers, users.length, isLoading]);

  const handleEdit = (user: any) => {
    setFormState({
      $id: user.$id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      isActive: user.isActive ?? true,
      permissions: user.permissions || [],
      branchIds: user.branchIds
        ? user.branchIds
        : user.branchId
          ? [user.branchId]
          : [],
    });
    setIsDialogOpen(true);
  };

  const confirmDelete = (user: any) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsSaving(true);
    try {
      const authId = userToDelete.accountId;
      if (!authId) {
        toast.error("Auth ID not found for this user.");
        return;
      }
      await deleteUser(authId);
      await databases.deleteDocument(DATABASE_ID, "users", userToDelete.$id);
      setIsDeleteOpen(false);
      toast.success("User removed from Auth and Database");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete user fully.");
    } finally {
      setIsSaving(false);
      setUserToDelete(null);
    }
  };

  const togglePermission = (permId: string) => {
    setFormState((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const toggleBranch = (branchId: string) => {
    setFormState((prev) => ({
      ...prev,
      branchIds: prev.branchIds.includes(branchId)
        ? prev.branchIds.filter((id) => id !== branchId)
        : [...prev.branchIds, branchId],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser(formState.$id, {
        role: formState.role,
        isActive: formState.isActive,
        permissions: formState.permissions,
        branchIds: formState.branchIds,
      } as Record<string, any>);
      setIsDialogOpen(false);
      toast.success("User updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user.");
    } finally {
      setIsSaving(false);
    }
  };

  const isGlobalAdmin =
    formState.role === "owner" || formState.role === "superadmin";

  // --- REFINED SUPERADMIN LOGIC ---

  // 1. Calculate how many superadmins exist in the database
  const superAdminCount = users.filter((u) => u.role === "superadmin").length;

  // 2. Determine if the user we are currently editing was ALREADY a superadmin
  const originalUser = users.find((u) => u.$id === formState.$id);
  const isOriginallySuperAdmin = originalUser?.role === "superadmin";

  // 4. Capacity Check: Is the limit reached?
  // We only block this if the count is 2+ AND the user being edited isn't one of them.
  const isMaxSuperAdminsReached =
    superAdminCount >= 2 && !isOriginallySuperAdmin;

  // The option is disabled if the current user doesn't have permission OR the cap is reached.
  const isSuperAdminOptionDisabled = isMaxSuperAdminsReached;

  return (
    <Card className="my-4 mb-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUsers className="h-5 w-5" /> User Access Control
        </CardTitle>
        <CardDescription>
          Grant specific section access and manage roles for staff members.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Branches</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              // Safely extract branch IDs for rendering
              const userBranchIds = user.branchIds
                ? user.branchIds
                : user.branchId
                  ? [user.branchId]
                  : [];

              return (
                <TableRow key={user.$id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role === "superadmin"
                        ? "Super Admin"
                        : user.role || "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Blocked</Badge>
                    )}
                  </TableCell>

                  {/* Permissions Column */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {user.permissions?.length > 0 ? (
                        user.permissions.map((p: string) => (
                          <span
                            key={p}
                            className={`text-[10px] px-1 rounded italic border ${
                              p === "read" || p === "write"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-slate-100"
                            }`}
                          >
                            {p.replace("access_", "")}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          None
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Branches Column */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {user.role === "superadmin" || user.role === "owner" ? (
                        <span className="text-[10px] px-1 rounded border bg-purple-100 text-purple-800 border-purple-200 font-medium">
                          All Branches
                        </span>
                      ) : userBranchIds.length > 0 ? (
                        userBranchIds
                          .map((id: string) => ({
                            id,
                            name: branches.find((b) => b.$id === id)?.name,
                          }))
                          // Only show branches that were actually found in the store
                          .filter((branch) => branch.name !== undefined)
                          .map((branch) => (
                            <span
                              key={branch.id}
                              className="text-[10px] px-1 rounded border bg-slate-50 text-slate-700 border-slate-200"
                            >
                              {branch.name}
                            </span>
                          ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => confirmDelete(user)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User: {formState.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">
                  User Role
                </Label>
                <Select
                  value={formState.role}
                  onValueChange={(val) =>
                    setFormState((prev) => ({ ...prev, role: val }))
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User / Staff</SelectItem>
                    <SelectItem value="dentist">Dentist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem
                      value="superadmin"
                      disabled={isSuperAdminOptionDisabled}
                    >
                      <div className="flex flex-col">
                        <span>Super Admin</span>
                        {/* Contextual feedback for why the option is disabled */}
                        {isMaxSuperAdminsReached && (
                          <span className="text-[10px] text-red-500 font-normal">
                            Account limit (2) reached
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">
                  Account Status
                </Label>
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-md border border-slate-100 h-10">
                  <span
                    className={cn(
                      "text-xs font-bold",
                      formState.isActive ? "text-green-600" : "text-red-500",
                    )}
                  >
                    {formState.isActive ? "Active" : "Blocked"}
                  </span>
                  <Switch
                    checked={formState.isActive}
                    onCheckedChange={(val) =>
                      setFormState((prev) => ({ ...prev, isActive: val }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Multiple Branch Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                Assigned Branches
              </Label>
              <div
                className={cn(
                  "grid grid-cols-2 gap-3 border rounded-md p-4 bg-slate-50/50 max-h-48 overflow-y-auto",
                  isGlobalAdmin && "opacity-60 pointer-events-none grayscale",
                )}
              >
                {branches.map((branch) => (
                  <div key={branch.$id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`branch-${branch.$id}`}
                      checked={
                        formState.branchIds.includes(branch.$id) ||
                        isGlobalAdmin
                      }
                      onCheckedChange={() => toggleBranch(branch.$id)}
                      disabled={isGlobalAdmin}
                    />
                    <label
                      htmlFor={`branch-${branch.$id}`}
                      className="text-sm font-medium cursor-pointer truncate"
                    >
                      {branch.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Permissions */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase">
                <IconDatabase className="h-4 w-4" /> Core Permissions
              </Label>
              <div className="grid grid-cols-2 gap-3 border border-blue-100 rounded-md p-4 bg-blue-50/30">
                {CORE_PERMISSIONS.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.id}
                      checked={formState.permissions.includes(section.id)}
                      onCheckedChange={() => togglePermission(section.id)}
                    />
                    <label
                      htmlFor={section.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {section.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Access */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-bold text-xs uppercase">
                <IconShieldLock className="h-4 w-4" /> App Section Access
              </Label>
              <div className="grid grid-cols-2 gap-3 border rounded-md p-4 bg-slate-50/50">
                {APP_SECTIONS.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.id}
                      checked={formState.permissions.includes(section.id)}
                      onCheckedChange={() => togglePermission(section.id)}
                    />
                    <label
                      htmlFor={section.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {section.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-lg border-t mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <IconAlertCircle className="h-5 w-5" /> Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{userToDelete?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
