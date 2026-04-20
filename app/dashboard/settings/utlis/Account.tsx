// components/settings/user-management-tab.tsx
"use client";

import * as React from "react";
import { IconEdit, IconTrash, IconUserPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Separator } from "@/components/ui/separator";

// --- Mock Data ---
const mockUsers = [
  {
    id: 1,
    name: "Dr. Evelyn Reed",
    email: "evelyn.r@clinic.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Marcus Hill",
    email: "marcus.h@clinic.com",
    role: "Dentist",
    status: "Active",
  },
  {
    id: 3,
    name: "Sarah Chen",
    email: "sarah.c@clinic.com",
    role: "Assistant",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Admin User",
    email: "admin@egargue.com",
    role: "Admin",
    status: "Active",
  },
];

// --- Sub-Component: Add/Edit User Dialog ---

// Note: In a real app, this would handle form submission logic
type User = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Dentist" | "Assistant" | string;
  status: "Active" | "Inactive" | string;
};

interface AddEditUserDialogProps {
  isEditing?: boolean;
  user?: User | null;
}

function AddEditUserDialog({
  isEditing = false,
  user = null,
}: AddEditUserDialogProps) {
  const title = isEditing ? "Edit User Account" : "Add New User";
  const description = isEditing
    ? "Update user details and permissions."
    : "Create a new user account and assign a role.";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={isEditing ? "ghost" : "default"}
          size={isEditing ? "icon" : "default"}
        >
          {isEditing ? (
            <IconEdit className="h-4 w-4" />
          ) : (
            <IconUserPlus className="mr-2 h-4 w-4" />
          )}
          {isEditing ? <span className="sr-only">Edit</span> : "Add User"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue={user?.name || ""}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              defaultValue={user?.email || ""}
              type="email"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select defaultValue={user?.role || "Dentist"}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Dentist">Dentist</SelectItem>
                <SelectItem value="Assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">
            {isEditing ? "Save Changes" : "Create Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Component ---
export function UserManagementTab() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl">User Management</CardTitle>
          <CardDescription>
            View, add, and manage staff accounts and roles.
          </CardDescription>
        </div>
        {/* Button to add new user */}
        <AddEditUserDialog isEditing={false} />
      </CardHeader>
      <CardContent>
        <Separator className="mb-4" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {/* Edit button opens the dialog with user data */}
                    <AddEditUserDialog isEditing={true} user={user} />

                    {/* Delete button (would need confirmation in a real app) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <IconTrash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
