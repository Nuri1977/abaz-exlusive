"use client";

import { useEffect, useState } from "react";
import { type User } from "@prisma/client";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/controllers/users/usersController";

import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { UserDialog } from "./UserDialog";

export function UserTable() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const { data: users = [], isLoading, isError, error, refetch } = useUsers();

  // Debug effect
  useEffect(() => {
    console.log("UserTable - Current users:", users);
    console.log("UserTable - Loading state:", isLoading);
    console.log("UserTable - Error state:", isError);
    if (error) {
      console.error("UserTable - Error:", error);
    }
  }, [users, isLoading, isError, error]);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsNewUser(true);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsNewUser(false);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUserSaved = async () => {
    setIsDialogOpen(false);
    await refetch(); // Refresh the router to invalidate cache
  };

  const handleUserDeleted = async () => {
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
    await refetch(); // Refresh the router to invalidate cache
  };

  const handleRefresh = async () => {
    await refetch(); // Refresh the router to invalidate cache
  };

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Failed to load users. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefresh}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription className="mt-1">
                Manage user accounts for the Abaz Exclusive platform.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="mr-2 size-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button size="sm" onClick={handleCreateUser}>
                <Plus className="mr-2 size-4" />
                <span className="hidden sm:inline">Add User</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden overflow-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(users) && users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="p-4 text-center text-muted-foreground"
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      (users).map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user?.name || (
                              <span className="italic text-muted-foreground">
                                No name
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{user?.email}</TableCell>
                          <TableCell>
                            {user?.emailVerified ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline">Unverified</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user?.isAdmin ? (
                              <Badge>Admin</Badge>
                            ) : (
                              <Badge variant="secondary">User</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(user?.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditUser(user)}
                              >
                                <Pencil className="size-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="size-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="block space-y-4 p-4 md:hidden">
                {Array.isArray(users) && users.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  (users).map((user: User) => (
                    <Card key={user?.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div>
                              <h3 className="font-medium">
                                {user?.name || (
                                  <span className="italic text-muted-foreground">
                                    No name
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {user?.email}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {user?.emailVerified ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline">Unverified</Badge>
                              )}
                              {user?.isAdmin ? (
                                <Badge>Admin</Badge>
                              ) : (
                                <Badge variant="secondary">User</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Created:{" "}
                              {format(new Date(user?.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                              >
                                <Pencil className="mr-2 size-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/40 p-3 text-sm">
          <div>Total users: {Array.isArray(users) ? users?.length : 0}</div>
        </CardFooter>
      </Card>

      <UserDialog
        user={selectedUser}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSaved={handleUserSaved}
        isNewUser={isNewUser}
        onCreateUser={createUser.mutate}
        onUpdateUser={updateUser.mutate}
      />

      <ConfirmDeleteDialog
        user={selectedUser}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeleted={handleUserDeleted}
        onDeleteUser={deleteUser.mutate}
      />
    </>
  );
}
