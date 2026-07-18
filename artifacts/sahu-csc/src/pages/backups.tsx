import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { BackupList } from "@/components/backups/BackupList";
import { BackupActions } from "@/components/backups/BackupActions";
import { BackupManualTrigger } from "@/components/backups/BackupManualTrigger";
import { BackupScheduleCard } from "@/components/backups/BackupScheduleCard";
import { BackupImportCard } from "@/components/backups/BackupImportCard";
import { BackupStorageTrend } from "@/components/backups/BackupStorageTrend";
import { useBackups } from "@/hooks/useBackups";

export default function Backups() {
  const { t } = useTranslation();

  const {
    backups, isLoading, createIsPending, restoreIsPending,
    restoreId, setRestoreId, restoreFilename,
    deleteId, setDeleteId, deleteFilename, deleteLoading,
    importStep, importFile, analyzedTables, selectedTables, originalName,
    confirmOpen, setConfirmOpen, fileRef,
    schedule, setSchedule, scheduleLoading, scheduleSaving,
    handleCreate, handleRestore, handleDelete,
    handleScheduleSave, toggleDay,
    handleFileSelect, handleAnalyze, toggleTable,
    handleSelectiveImport, resetImport,
    onRestoreClick, onDeleteClick,
    nextRunLabel, totalSize, chartData,
  } = useBackups();

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl">

        <BackupManualTrigger
          backupsCount={backups?.length ?? 0}
          createIsPending={createIsPending}
          onCreate={() => handleCreate(t("backups.toast_created"), t("backups.title"))}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BackupList
              backups={backups}
              isLoading={isLoading}
              totalSize={totalSize}
              onRestoreClick={onRestoreClick}
              onDeleteClick={onDeleteClick}
              t={t}
            />
          </div>

          <div className="space-y-6">
            <BackupScheduleCard
              schedule={schedule}
              setSchedule={setSchedule}
              scheduleLoading={scheduleLoading}
              scheduleSaving={scheduleSaving}
              handleScheduleSave={handleScheduleSave}
              toggleDay={toggleDay}
              nextRunLabel={nextRunLabel}
            />
            <BackupImportCard
              importStep={importStep}
              importFile={importFile}
              analyzedTables={analyzedTables}
              selectedTables={selectedTables}
              fileRef={fileRef}
              handleFileSelect={handleFileSelect}
              handleAnalyze={handleAnalyze}
              toggleTable={toggleTable}
              resetImport={resetImport}
              setConfirmOpen={setConfirmOpen}
            />
          </div>
        </div>

        <BackupStorageTrend
          backups={backups}
          chartData={chartData}
          totalSize={totalSize}
        />

      </div>

      <BackupActions
        restoreId={restoreId}
        setRestoreId={setRestoreId}
        restoreFilename={restoreFilename}
        restoreIsPending={restoreIsPending}
        handleRestore={handleRestore}
        deleteId={deleteId}
        setDeleteId={setDeleteId}
        deleteFilename={deleteFilename}
        deleteLoading={deleteLoading}
        handleDelete={handleDelete}
        confirmOpen={confirmOpen}
        setConfirmOpen={setConfirmOpen}
        selectedTables={selectedTables}
        analyzedTables={analyzedTables}
        originalName={originalName}
        handleSelectiveImport={handleSelectiveImport}
        t={t}
      />
    </Layout>
  );
}
