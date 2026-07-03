import React, { useState } from "react";
import { useStore } from "../../hooks/useStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Save } from "lucide-react";

export function Settings() {
  const { profile, updateProfile } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    
    const formData = new FormData(e.currentTarget);
    
    await updateProfile({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      defaultTaxRate: Number(formData.get("defaultTaxRate")),
      defaultTerms: formData.get("defaultTerms") as string,
    });
    
    setIsSaving(false);
    setMessage("Settings saved successfully.");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500">Manage your company profile and default quote settings.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              name="name" 
              label="Company Name" 
              defaultValue={profile.name} 
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input 
                name="email" 
                type="email" 
                label="Business Email" 
                defaultValue={profile.email} 
              />
              <Input 
                name="phone" 
                type="tel" 
                label="Phone Number" 
                defaultValue={profile.phone} 
              />
            </div>
            <Textarea 
              name="address" 
              label="Company Address" 
              defaultValue={profile.address} 
              rows={2}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-xs">
              <Input 
                name="defaultTaxRate" 
                type="number" 
                step="0.01"
                min="0"
                label="Default Tax Rate (%)" 
                defaultValue={profile.defaultTaxRate} 
              />
            </div>
            <Textarea 
              name="defaultTerms" 
              label="Default Terms & Conditions" 
              defaultValue={profile.defaultTerms} 
              rows={4}
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 pt-2 pb-8">
          <Button type="submit" disabled={isSaving} className="min-w-32 shadow-sm">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          {message && (
            <span className="text-sm font-medium text-green-600 animate-in fade-in">{message}</span>
          )}
        </div>
      </form>
    </div>
  );
}
