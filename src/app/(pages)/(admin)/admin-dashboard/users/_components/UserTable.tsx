"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { UserDialog } from "./UserDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/controllers/users/users-controller";
import { User } from "@prisma/client";

export function UserTable() {
  const { toast } = useToast();
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
            <div className="flex items-center mt-2 sm:mt-0 gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={handleCreateUser}>
                <Plus className="h-4 w-4 mr-2" />
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
            <div className="flex justify-center items-center p-8">
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
                        className="text-center text-muted-foreground p-4"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    (users as User[]).map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.name || (
                            <span className="text-muted-foreground italic">
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
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
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
        <CardFooter className="bg-muted/40 border-t p-3 text-sm flex justify-between">
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
