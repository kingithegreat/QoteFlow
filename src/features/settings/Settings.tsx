import React, { useState, useRef } from "react";
import { useStore } from "../../hooks/useStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Save, Download, Upload } from "lucide-react";
import { downloadBackup, restoreBackup } from "../../lib/backup";

export function Settings() {
  const { profile, updateProfile, reloadData } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [backupMessage, setBackupMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      await downloadBackup();
      setBackupMessage({ text: "Backup downloaded. Keep it somewhere safe.", isError: false });
    } catch (err) {
      console.error("Backup export failed", err);
      setBackupMessage({ text: "Failed to create backup. Please try again.", isError: true });
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!confirm("Restore this backup? Items with matching IDs will be overwritten. Your other data is kept.")) {
      return;
    }

    try {
      const text = await file.text();
      const { customers, quotes } = await restoreBackup(text);
      await reloadData();
      setBackupMessage({
        text: `Backup restored: ${quotes} quote(s) and ${customers} customer(s).`,
        isError: false,
      });
    } catch (err) {
      console.error("Backup restore failed", err);
      setBackupMessage({
        text: err instanceof Error ? err.message : "Failed to restore backup.",
        isError: true,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    
    const formData = new FormData(e.currentTarget);
    
    await updateProfile({
      ...profile,
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

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" disabled={isSaving} className="min-w-32 shadow-sm">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          {message && (
            <span className="text-sm font-medium text-green-600 animate-in fade-in">{message}</span>
          )}
        </div>
      </form>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Backup &amp; Restore</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Your data lives only on this device. Download a backup regularly so you can recover
            your quotes and customers if this device is lost or the browser data is cleared.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" onClick={handleExport} className="shadow-sm">
              <Download className="mr-2 h-4 w-4" />
              Download Backup
            </Button>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="shadow-sm">
              <Upload className="mr-2 h-4 w-4" />
              Restore Backup
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
          {backupMessage && (
            <p className={`text-sm font-medium animate-in fade-in ${backupMessage.isError ? "text-red-600" : "text-green-600"}`}>
              {backupMessage.text}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
