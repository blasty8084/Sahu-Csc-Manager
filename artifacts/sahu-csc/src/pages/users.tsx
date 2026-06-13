import { useState } from "react";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey, UserInputRole } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";

interface UserForm {
  username: string;
  email: string;
  mobile: string;
  fullName: string;
  password: string;
  role: string;
  isActive: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  operator: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  user: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

export default function Users() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: users, isLoading } = useListUsers();
  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const deleteMut = useDeleteUser();

  const form = useForm<UserForm>({
    defaultValues: { username: "", email: "", mobile: "", fullName: "", password: "", role: "operator", isActive: true }
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListUsersQueryKey() });

  const openCreate = () => {
    setEditUser(null);
    form.reset({ username: "", email: "", mobile: "", fullName: "", password: "", role: "operator", isActive: true });
    setShowForm(true);
  };

  const openEdit = (u: any) => {
    setEditUser(u);
    form.reset({ username: u.username, email: u.email, mobile: u.mobile ?? "", fullName: u.fullName ?? "", password: "", role: u.role, isActive: u.isActive });
    setShowForm(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editUser) {
        const data: any = { username: values.username, email: values.email, role: values.role, isActive: values.isActive };
        if (values.mobile) data.mobile = values.mobile;
        if (values.fullName) data.fullName = values.fullName;
        if (values.password) data.password = values.password;
        await updateMut.mutateAsync({ id: editUser.id, data });
        toast({ title: "User updated" });
      } else {
        await createMut.mutateAsync({ data: { ...values, role: values.role as UserInputRole, mobile: values.mobile || undefined, fullName: values.fullName || undefined } });
        toast({ title: "User created" });
      }
      setShowForm(false);
      invalidate();
    } catch {
      toast({ title: "Failed to save user", variant: "destructive" });
    }
  });

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMut.mutateAsync({ id: deleteId });
      toast({ title: "User deleted" });
      setDeleteId(null);
      invalidate();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">User Management</h2>
            <p className="text-sm text-muted-foreground">{users?.length ?? 0} users registered</p>
          </div>
          <Button size="sm" onClick={openCreate} data-testid="button-new-user">
            <Plus size={14} className="mr-1.5" />Add User
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : users?.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No users found</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 sm:hidden">
              {users?.map((user: any) => (
                <div key={user.id} className="bg-card border rounded-xl p-4 space-y-3" data-testid={`row-user-${user.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-sm bg-primary/10 text-primary">{(user.fullName || user.username).charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{user.fullName || user.username}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)}><Pencil size={13} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(user.id)}><Trash2 size={13} /></Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[user.role] ?? ""}`}>{user.role}</span>
                    <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>{user.email}</p>
                    {user.mobile && <p>{user.mobile}</p>}
                    <p>Joined {new Date(user.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block border rounded-lg overflow-hidden bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Contact</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users?.map((user: any) => (
                    <tr key={user.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-user-${user.id}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">{(user.fullName || user.username).charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullName || user.username}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs">{user.email}</p>
                        {user.mobile && <p className="text-xs text-muted-foreground">{user.mobile}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[user.role] ?? ""}`}>{user.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(user)}><Pencil size={12} /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(user.id)}><Trash2 size={12} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editUser ? "Edit User" : "Add User"}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Username</Label>
                <Input {...form.register("username", { required: true })} placeholder="username" data-testid="input-username" />
              </div>
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input {...form.register("fullName")} placeholder="Full name" data-testid="input-fullname" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Email</Label>
                <Input type="email" {...form.register("email", { required: true })} placeholder="email@example.com" data-testid="input-email" />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile</Label>
                <Input {...form.register("mobile")} placeholder="9999999999" data-testid="input-mobile" />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={form.watch("role")} onValueChange={(v) => form.setValue("role", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>{editUser ? "New Password (leave blank to keep)" : "Password"}</Label>
                <Input type="password" {...form.register("password", { required: !editUser })} placeholder="Password" data-testid="input-password" />
              </div>
              {editUser && (
                <div className="col-span-2 flex items-center gap-2">
                  <Switch checked={form.watch("isActive")} onCheckedChange={(v) => form.setValue("isActive", v)} id="user-active" />
                  <Label htmlFor="user-active">Active</Label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending} data-testid="button-save-user">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete User?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
