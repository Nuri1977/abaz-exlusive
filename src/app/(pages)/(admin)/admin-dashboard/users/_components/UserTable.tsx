"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import { format } from "date-fns";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

import { useToast } from "@/hooks/useToast";
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

  const handleUserSaved = () => {
    setIsDialogOpen(false);
    refetch(); // Refresh the router to invalidate cache
  };

  const handleUserDeleted = () => {
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
    refetch(); // Refresh the router to invalidate cache
  };

  const handleRefresh = () => {
    refetch(); // Refresh the router to invalidate cache
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Users</CardTitle>
            <div className="mt-2 flex items-center gap-2 sm:mt-0">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="mr-2 size-4" />
                Refresh
              </Button>
              <Button size="sm" onClick={handleCreateUser}>
                <Plus className="mr-2 size-4" />
                Add User
              </Button>
            </div>
          </div>
          <CardDescription>
            Manage user accounts for the Shalom Radio platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-auto">
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
                    (users as User[]).map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.name || (
                            <span className="italic text-muted-foreground">
                              No name
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.emailVerified ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge>Admin</Badge>
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
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
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/40 p-3 text-sm">
          <div>Total users: {Array.isArray(users) ? users.length : 0}</div>
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
