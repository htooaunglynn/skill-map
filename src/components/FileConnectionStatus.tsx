"use client";

import { useRef, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    FilePlus2,
    FolderOpen,
    KeyRound,
    Unplug,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { usePlanner } from "@/src/context/PlannerContext";

function formatSavedTime(value: string | undefined): string {
    if (!value) {
        return "not synced yet";
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function FileConnectionStatus() {
    const {
        data,
        syncStatus,
        isLoading,
        createFileForSync,
        connectFileForSync,
        disconnectFile,
        grantWritePermission,
        exportJsonBackup,
        importJsonBackup,
    } = usePlanner();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    async function runAction(action: () => Promise<void>): Promise<void> {
        setErrorMessage(null);

        try {
            await action();
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Unable to complete action.",
            );
        }
    }

    async function importSelectedFile(file: File | undefined): Promise<void> {
        if (!file) return;
        await runAction(() => importJsonBackup(file));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const backupControls = (
        <>
            <Button
                type="button"
                variant="outline"
                onClick={exportJsonBackup}
                disabled={!data || isLoading}
            >
                <Download aria-hidden="true" />
                Export JSON
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                    void importSelectedFile(event.target.files?.[0]);
                }}
            />
            <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
            >
                <Upload aria-hidden="true" />
                Import JSON
            </Button>
        </>
    );

    if (syncStatus === "connected") {
        return (
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                        File Sync Connected
                    </CardTitle>
                    <CardDescription>
                        Browser data is saved. Last synced to file {formatSavedTime(data?.sync.last_saved_at)}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {backupControls}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void runAction(disconnectFile)}
                        disabled={isLoading}
                    >
                        <Unplug aria-hidden="true" />
                        Disconnect File
                    </Button>
                    {errorMessage ? (
                        <p className="text-sm text-destructive">{errorMessage}</p>
                    ) : null}
                </CardContent>
            </Card>
        );
    }

    if (syncStatus === "permission_required") {
        return (
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="size-4" aria-hidden="true" />
                        File Sync Permission Required
                    </CardTitle>
                    <CardDescription>
                        Browser data is still saved. Grant access to resume syncing a connected planner file.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                        type="button"
                        onClick={() => void runAction(grantWritePermission)}
                        disabled={isLoading}
                    >
                        <KeyRound aria-hidden="true" />
                        Grant Write Permission
                    </Button>
                    {backupControls}
                    {errorMessage ? (
                        <p className="text-sm text-destructive">{errorMessage}</p>
                    ) : null}
                </CardContent>
            </Card>
        );
    }

    if (syncStatus === "sync_unsupported") {
        return (
            <Card className="border-border bg-secondary text-secondary-foreground">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-4" aria-hidden="true" />
                        File Sync Unavailable
                    </CardTitle>
                    <CardDescription>
                        This browser cannot sync to a local file automatically, but your planner is saved in this browser. Export after edits to keep a portable backup and clear the close-tab warning until your next change.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {backupControls}
                    {errorMessage ? (
                        <p className="text-sm text-destructive">{errorMessage}</p>
                    ) : null}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle>Optional File Sync</CardTitle>
                <CardDescription>
                    Your planner is saved in this browser. Connect a JSON file only if you want a local sync copy.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                    type="button"
                    onClick={() => void runAction(createFileForSync)}
                    disabled={isLoading}
                >
                    <FilePlus2 aria-hidden="true" />
                    Create Sync File
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => void runAction(connectFileForSync)}
                    disabled={isLoading}
                >
                    <FolderOpen aria-hidden="true" />
                    Connect Existing File
                </Button>
                {backupControls}
                {errorMessage ? (
                    <p className="text-sm text-destructive">{errorMessage}</p>
                ) : null}
            </CardContent>
        </Card>
    );
}
