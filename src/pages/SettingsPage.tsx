import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const [fullName, setFullName] = useState("Admin User");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    toast({ title: "Profile updated successfully" });
    setPassword(""); setConfirmPassword("");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>Full Name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
            <div><Label>Email</Label><Input value="admin@ortho.uz" disabled /></div>
            <div><Label>New Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" /></div>
            <div><Label>Confirm Password</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
