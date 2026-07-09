import React, { useState } from 'react';
import {
  Database, Download, RotateCcw, Upload, Calendar, Clock, Settings2,
  CheckCircle2, AlertCircle, FileDown, Trash2, HardDrive, Activity, History,
  ChevronRight, ShieldCheck, Server, Play, FileJson, Layers
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import './_group.css';

interface BackupRecord {
  id: string;
  filename: string;
  size: string;
  date: string;
  status: 'success' | 'failed';
  type: 'auto' | 'manual';
}

const mockBackups: BackupRecord[] = [
  { id: '1', filename: 'backup_2026-06-28T02-00-00.sql', size: '4.2 MB', date: '2026-06-28 02:00', status: 'success', type: 'auto' },
  { id: '2', filename: 'backup_2026-06-27T02-00-00.sql', size: '4.1 MB', date: '2026-06-27 02:00', status: 'success', type: 'auto' },
  { id: '3', filename: 'manual_backup_2026-06-26T14-30-00.sql', size: '4.1 MB', date: '2026-06-26 14:30', status: 'success', type: 'manual' },
  { id: '4', filename: 'backup_2026-06-26T02-00-00.sql', size: '4.0 MB', date: '2026-06-26 02:00', status: 'success', type: 'auto' },
];

export function CommandCenter() {
  const [activeTab, setActiveTab] = useState('backups');
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  
  // Import wizard state
  const [importStep, setImportStep] = useState(1);
  const [fileSelected, setFileSelected] = useState(false);

  const handleRestoreClick = (backup: BackupRecord) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] minimal-clean-theme flex flex-col font-sans">
      {/* Top Header - Navy */}
      <div className="bg-[#0b2c60] text-white pt-6 pb-16 px-6 lg:px-8 border-b border-[#082046]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                <Database className="h-6 w-6 text-[#f97316]" />
                Database Command Center
              </h1>
              <p className="text-slate-300 mt-1 text-sm font-mono">SAHU_CSC_PROD • v2.4.1</p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white font-medium border-0">
                <Download className="h-4 w-4 mr-2" />
                Backup Now
              </Button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#113670] rounded-lg p-4 border border-[#1e4483]">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold flex items-center gap-1">
                <History className="h-3 w-3" /> Total Backups
              </div>
              <div className="text-2xl font-bold text-white">24</div>
            </div>
            <div className="bg-[#113670] rounded-lg p-4 border border-[#1e4483]">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Last Successful
              </div>
              <div className="text-lg font-bold text-white font-mono">Today, 02:00</div>
            </div>
            <div className="bg-[#113670] rounded-lg p-4 border border-[#1e4483]">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold flex items-center gap-1">
                <Clock className="h-3 w-3" /> Next Run
              </div>
              <div className="text-lg font-bold text-white font-mono">Tomorrow, 02:00</div>
            </div>
            <div className="bg-[#113670] rounded-lg p-4 border border-[#1e4483] flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Schedule
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${scheduleEnabled ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-400'}`}></div>
                  <span className="font-semibold text-white">{scheduleEnabled ? 'Active' : 'Paused'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full -mt-8 flex-1 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white p-1 rounded-lg border shadow-sm mb-6 h-auto">
            <TabsTrigger value="backups" className="px-6 py-2.5 rounded-md data-[state=active]:bg-[#f97316] data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <HardDrive className="h-4 w-4 mr-2" />
              Archives
            </TabsTrigger>
            <TabsTrigger value="schedule" className="px-6 py-2.5 rounded-md data-[state=active]:bg-[#f97316] data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Calendar className="h-4 w-4 mr-2" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="import" className="px-6 py-2.5 rounded-md data-[state=active]:bg-[#f97316] data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ARCHIVES */}
          <TabsContent value="backups" className="mt-0 outline-none">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-[#0b2c60] flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-slate-400" />
                  Available Restores
                </CardTitle>
                <CardDescription>View, download or restore from your recent database snapshots.</CardDescription>
              </CardHeader>
              <div className="bg-white">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[300px]">Filename</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBackups.map((backup, idx) => (
                      <TableRow key={backup.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <TableCell className="font-mono text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <FileJson className="h-4 w-4 text-slate-400" />
                            {backup.filename}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{backup.size}</TableCell>
                        <TableCell className="text-slate-600">{backup.date}</TableCell>
                        <TableCell>
                          {backup.type === 'auto' ? (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">System</Badge>
                          ) : (
                            <Badge variant="outline" className="border-slate-300 text-slate-600">Manual</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 text-slate-600 hover:text-[#0b2c60]">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => handleRestoreClick(backup)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: SCHEDULE */}
          <TabsContent value="schedule" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-[#0b2c60]">Automation Policies</CardTitle>
                        <CardDescription>Configure when the system should snapshot your data.</CardDescription>
                      </div>
                      <Switch 
                        checked={scheduleEnabled} 
                        onCheckedChange={setScheduleEnabled}
                        className="data-[state=checked]:bg-[#f97316]"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className={`p-6 space-y-6 bg-white ${!scheduleEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    
                    <div className="space-y-3">
                      <Label className="text-slate-700 font-semibold text-sm">Frequency</Label>
                      <RadioGroup defaultValue="daily" className="flex flex-col md:flex-row gap-4">
                        <div className="flex items-center space-x-2 border rounded-md p-3 flex-1 bg-slate-50 cursor-pointer hover:border-[#f97316] transition-colors">
                          <RadioGroupItem value="daily" id="daily" className="text-[#f97316]" />
                          <Label htmlFor="daily" className="cursor-pointer font-medium">Daily</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:border-[#f97316] transition-colors">
                          <RadioGroupItem value="weekly" id="weekly" className="text-[#f97316]" />
                          <Label htmlFor="weekly" className="cursor-pointer font-medium">Weekly</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:border-[#f97316] transition-colors">
                          <RadioGroupItem value="custom" id="custom" className="text-[#f97316]" />
                          <Label htmlFor="custom" className="cursor-pointer font-medium">Custom</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-3">
                        <Label className="text-slate-700 font-semibold text-sm">Execution Time</Label>
                        <Select defaultValue="02:00">
                          <SelectTrigger className="w-full font-mono">
                            <Clock className="w-4 h-4 mr-2 text-slate-400" />
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="00:00">00:00 (Midnight)</SelectItem>
                            <SelectItem value="01:00">01:00 AM</SelectItem>
                            <SelectItem value="02:00">02:00 AM</SelectItem>
                            <SelectItem value="03:00">03:00 AM</SelectItem>
                            <SelectItem value="04:00">04:00 AM</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">System timezone is Asia/Kolkata (IST)</p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-slate-700 font-semibold text-sm">Retention Policy</Label>
                        <Select defaultValue="30">
                          <SelectTrigger className="w-full">
                            <ShieldCheck className="w-4 h-4 mr-2 text-slate-400" />
                            <SelectValue placeholder="Keep backups for" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">Keep last 7 days</SelectItem>
                            <SelectItem value="14">Keep last 14 days</SelectItem>
                            <SelectItem value="30">Keep last 30 days</SelectItem>
                            <SelectItem value="90">Keep last 90 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-slate-700 font-semibold text-sm">Active Days (if Weekly/Custom)</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div 
                            key={day} 
                            className={`px-4 py-2 text-sm rounded-full border cursor-pointer font-medium transition-colors
                              ${['Mon', 'Wed', 'Fri'].includes(day) 
                                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 border-t border-slate-100 justify-end py-4">
                    <Button className="bg-[#0b2c60] hover:bg-[#113670] text-white">Save Schedule</Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Status Side Card */}
              <div>
                <Card className="border-slate-200 shadow-sm bg-gradient-to-b from-white to-slate-50">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <CardTitle className="text-md flex items-center gap-2 text-slate-800">
                      <Settings2 className="h-4 w-4 text-slate-500" />
                      Current Policy Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">Status</span>
                      <Badge className={scheduleEnabled ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-200 text-slate-600'}>
                        {scheduleEnabled ? 'Enforcing' : 'Suspended'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">Mode</span>
                      <span className="font-medium text-slate-800">Daily</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">Target Time</span>
                      <span className="font-mono text-slate-800">02:00 IST</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">Retention</span>
                      <span className="font-medium text-slate-800">30 days</span>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded p-3 mt-4 flex gap-3">
                      <Server className="h-5 w-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-blue-800 font-medium text-xs mb-1">Storage Health</p>
                        <p className="text-blue-600 text-xs leading-relaxed">
                          Currently using ~120MB of allocated 5GB backup storage. 
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: IMPORT WIZARD */}
          <TabsContent value="import" className="mt-0 outline-none">
            <Card className="border-slate-200 shadow-sm max-w-3xl mx-auto">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle className="text-lg text-[#0b2c60]">Data Import Wizard</CardTitle>
                <CardDescription>Upload an SQL dump to selectively import tables.</CardDescription>
                
                {/* Stepper */}
                <div className="flex items-center mt-6 mb-2 max-w-md mx-auto">
                  <div className={`flex flex-col items-center flex-1 ${importStep >= 1 ? 'text-[#f97316]' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 border-2 
                      ${importStep >= 1 ? 'border-[#f97316] bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>1</div>
                    <span className="text-xs font-semibold">Upload</span>
                  </div>
                  <div className={`h-[2px] flex-1 -mt-6 ${importStep >= 2 ? 'bg-[#f97316]' : 'bg-slate-200'}`}></div>
                  <div className={`flex flex-col items-center flex-1 ${importStep >= 2 ? 'text-[#f97316]' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 border-2 
                      ${importStep >= 2 ? 'border-[#f97316] bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>2</div>
                    <span className="text-xs font-semibold">Analyze</span>
                  </div>
                  <div className={`h-[2px] flex-1 -mt-6 ${importStep >= 3 ? 'bg-[#f97316]' : 'bg-slate-200'}`}></div>
                  <div className={`flex flex-col items-center flex-1 ${importStep >= 3 ? 'text-[#f97316]' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 border-2 
                      ${importStep >= 3 ? 'border-[#f97316] bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>3</div>
                    <span className="text-xs font-semibold">Execute</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 bg-white">
                
                {importStep === 1 && (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-12 bg-slate-50 hover:bg-slate-100 hover:border-[#f97316]/50 transition-colors cursor-pointer"
                       onClick={() => setFileSelected(true)}>
                    {!fileSelected ? (
                      <>
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <Upload className="h-8 w-8 text-[#0b2c60]" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">Click to select SQL file</h3>
                        <p className="text-sm text-slate-500 mb-4">or drag and drop here</p>
                        <p className="text-xs text-slate-400 font-mono">Accepts .sql or .sql.gz (Max 50MB)</p>
                      </>
                    ) : (
                      <>
                        <FileJson className="h-12 w-12 text-[#f97316] mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">legacy_export_2025.sql</h3>
                        <p className="text-sm text-slate-500">12.4 MB • Ready to analyze</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-4 text-slate-500"
                          onClick={(e) => { e.stopPropagation(); setFileSelected(false); }}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {importStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 text-amber-800 text-sm">
                      <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                      <div>
                        <strong>Analysis Complete.</strong> We found 4 tables in the dump. Select the ones you want to merge into the current database. Existing records with conflicting IDs may be overwritten.
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center gap-3">
                        <Checkbox id="selectAll" className="data-[state=checked]:bg-[#f97316]" />
                        <Label htmlFor="selectAll" className="font-semibold text-slate-700">Select All</Label>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {[
                          { name: 'users', rows: 42, size: '14 KB' },
                          { name: 'ledger_entries', rows: 1240, size: '2.1 MB' },
                          { name: 'transactions', rows: 845, size: '1.8 MB' },
                          { name: 'settings', rows: 12, size: '4 KB' }
                        ].map(table => (
                          <div key={table.name} className="p-3 px-4 flex items-center justify-between hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <Checkbox id={`tbl-${table.name}`} defaultChecked className="data-[state=checked]:bg-[#f97316]" />
                              <Label htmlFor={`tbl-${table.name}`} className="font-mono text-sm cursor-pointer">{table.name}</Label>
                            </div>
                            <div className="text-xs text-slate-500 flex gap-4">
                              <span>{table.rows} rows</span>
                              <span className="w-16 text-right">{table.size}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {importStep === 3 && (
                  <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Import Successful</h3>
                    <p className="text-center text-slate-600 max-w-md">
                      Successfully imported 3 tables and merged 2,085 rows into the current database.
                    </p>
                    <div className="pt-6">
                      <Button onClick={() => { setImportStep(1); setFileSelected(false); }} className="bg-[#0b2c60] hover:bg-[#113670]">
                        Return to Command Center
                      </Button>
                    </div>
                  </div>
                )}

              </CardContent>
              <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-between p-4">
                <Button 
                  variant="outline" 
                  disabled={importStep === 1}
                  onClick={() => setImportStep(prev => prev - 1)}
                >
                  Back
                </Button>
                
                {importStep === 1 && (
                  <Button 
                    className="bg-[#f97316] hover:bg-[#ea580c] text-white" 
                    disabled={!fileSelected}
                    onClick={() => setImportStep(2)}
                  >
                    Analyze File <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                
                {importStep === 2 && (
                  <Button 
                    className="bg-[#0b2c60] hover:bg-[#113670] text-white" 
                    onClick={() => setImportStep(3)}
                  >
                    Execute Import <Play className="w-4 h-4 ml-2" />
                  </Button>
                )}
                
                {importStep === 3 && (
                  <div></div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Critical Action: Database Restore
            </DialogTitle>
            <DialogDescription className="pt-3 pb-2 text-slate-600 space-y-3">
              <p>
                You are about to overwrite the <strong>entire active database</strong> with the snapshot from:
              </p>
              <div className="bg-slate-100 p-3 rounded font-mono text-sm border border-slate-200 text-slate-800">
                {selectedBackup?.filename}
              </div>
              <p className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded">
                Warning: Any changes made after {selectedBackup?.date} will be permanently lost. This action cannot be undone.
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2">
            <Label htmlFor="confirm" className="text-sm text-slate-700 mb-2 block">
              Type <strong className="text-slate-900 select-none">CONFIRM</strong> to proceed
            </Label>
            <Input id="confirm" placeholder="" className="font-mono" />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white border-0">
              <RotateCcw className="w-4 h-4 mr-2" />
              Execute Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
