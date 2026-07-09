import React, { useState } from "react";
import "./_group.css";
import {
  Button,
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Database,
  Download,
  RotateCcw,
  UploadCloud,
  Plus,
  CalendarClock,
  HardDriveDownload,
  AlertTriangle
} from "lucide-react";

// Mock Data
const MOCK_BACKUPS = [
  { id: 1, filename: "backup_2026-06-30T02-00-00.sql", size: "4.2 MB", date: "2 hours ago" },
  { id: 2, filename: "backup_2026-06-29T02-00-00.sql", size: "4.1 MB", date: "1 day ago" },
  { id: 3, filename: "backup_2026-06-22T02-00-00.sql", size: "3.9 MB", date: "8 days ago" },
  { id: 4, filename: "backup_manual_2026-06-15T14-30-00.sql", size: "3.8 MB", date: "15 days ago" },
];

export function MinimalClean() {
  const [scheduleActive, setScheduleActive] = useState(true);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<typeof MOCK_BACKUPS[0] | null>(null);

  const handleRestoreClick = (backup: typeof MOCK_BACKUPS[0]) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
  };

  return (
    <div className="minimal-clean-theme min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Backup & Restore</h1>
            <p className="text-slate-500 mt-1">Manage database snapshots and scheduled backups</p>
          </div>
          <Button className="btn-saffron hover:bg-[#ea580c] shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Backup
          </Button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Backup History */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-accent-top shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Database className="h-5 w-5 text-slate-400" />
                  Backup History
                </CardTitle>
                <CardDescription>Available snapshots ready for restoration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-100 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3 font-medium">Filename</th>
                        <th className="px-4 py-3 font-medium">Size</th>
                        <th className="px-4 py-3 font-medium">Created</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {MOCK_BACKUPS.map((backup) => (
                        <tr key={backup.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-indigo-50 text-[#0b2c60] rounded-md">
                                <Database className="h-4 w-4" />
                              </div>
                              <span className="font-mono text-xs font-medium text-slate-700">
                                {backup.filename}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                              {backup.size}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {backup.date}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-8 action-btn text-slate-500 hover:text-[#0b2c60] hover:border-[#0b2c60] relative justify-start px-2"
                              >
                                <Download className="h-4 w-4 shrink-0" />
                                <span className="btn-text text-xs ml-2 font-medium">Download</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleRestoreClick(backup)}
                                className="h-8 action-btn text-slate-500 hover:text-amber-600 hover:border-amber-600 relative justify-start px-2"
                              >
                                <RotateCcw className="h-4 w-4 shrink-0" />
                                <span className="btn-text text-xs ml-2 font-medium">Restore</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Schedule & Import */}
          <div className="space-y-6">
            
            {/* Schedule Card */}
            <Card className="card-accent-top shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-slate-400" />
                    Auto-Backup
                  </CardTitle>
                  <Switch 
                    checked={scheduleActive} 
                    onCheckedChange={setScheduleActive}
                    className="data-[state=checked]:bg-[#f97316]"
                  />
                </div>
                {scheduleActive ? (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="text-sm text-slate-600 font-medium">Active</span>
                    <span className="text-sm text-slate-400 ml-auto">Next: Tomorrow, 2:00 AM</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex h-2 w-2 rounded-full bg-slate-300"></span>
                    <span className="text-sm text-slate-500">Disabled</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className={`space-y-5 transition-opacity ${scheduleActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Frequency</Label>
                    <Select defaultValue="weekly" disabled={!scheduleActive}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Time</Label>
                      <Select defaultValue="02:00" disabled={!scheduleActive}>
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="00:00">12:00 AM</SelectItem>
                          <SelectItem value="02:00">02:00 AM</SelectItem>
                          <SelectItem value="04:00">04:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Retain</Label>
                      <Select defaultValue="10" disabled={!scheduleActive}>
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 backups</SelectItem>
                          <SelectItem value="10">10 backups</SelectItem>
                          <SelectItem value="30">30 backups</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Days</Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
                        <div 
                          key={day} 
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer transition-colors
                            ${i === 0 ? 'bg-[#0b2c60] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                          `}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Import Card */}
            <Card className="card-accent-top shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HardDriveDownload className="h-5 w-5 text-slate-400" />
                  Import Data
                </CardTitle>
                <CardDescription>Restore from a local .sql file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                  <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-6 w-6 text-[#f97316]" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Click to upload file</p>
                  <p className="text-xs text-slate-500 mt-1">or drag and drop .sql here</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl">Restore Database?</DialogTitle>
            <DialogDescription className="text-center pt-2 text-slate-600">
              This action will overwrite your current database with the snapshot from:
              <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-100 font-mono text-xs text-slate-800 text-left">
                {selectedBackup?.filename}
              </div>
              <p className="mt-3 text-red-600 font-medium text-sm">
                All changes made since this backup will be permanently lost.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-4 sm:space-x-0">
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setRestoreDialogOpen(false)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
              Yes, Restore Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
