import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserFormDesktop } from "./UserFormDesktop";
import type { UserForm } from "./users.constants";

interface UserFormDialogProps {
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  isMobile: boolean | undefined;
  editUser: any;
  form: UseFormReturn<UserForm>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void> | void;
  saving: boolean;
  showPassword: boolean;
  setShowPassword: (v: boolean | ((p: boolean) => boolean)) => void;
}

export function UserFormDialog({
  showForm,
  setShowForm,
  isMobile,
  editUser,
  form,
  onSubmit,
  saving,
  showPassword,
  setShowPassword,
}: UserFormDialogProps) {
  return (
    <>
      {/* Create/Edit User — Mobile Dialog */}
      <Dialog open={showForm && !!isMobile} onOpenChange={setShowForm}>
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
              <Button type="submit" disabled={saving} data-testid="button-save-user">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create/Edit User — Desktop (split layout) */}
      {!isMobile && showForm && (
        <UserFormDesktop
          setShowForm={setShowForm}
          editUser={editUser}
          form={form}
          onSubmit={onSubmit}
          saving={saving}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      )}
    </>
  );
}

export default UserFormDialog;
