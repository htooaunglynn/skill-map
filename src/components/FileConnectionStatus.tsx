"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FilePlus2, FolderOpen, KeyRound } from "lucide-react";
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
        return "Not saved yet";
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function FileConnectionStatus() {
    const {
        data,
        connectionStatus,
        isLoading,
        createNewPlanner,
        openExistingPlanner,
        grantWritePermission,
        exportJsonBackup,
    } = usePlanner();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    if (connectionStatus === "connected") {
        return (
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                        File Connected
                    </CardTitle>
                    <CardDescription>
                        Last saved {formatSavedTime(data?.sync.last_saved_at)}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (connectionStatus === "permission_required") {
        return (
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="size-4" aria-hidden="true" />
                        Permission Required
                    </CardTitle>
                    <CardDescription>
                        Grant write access to keep saving changes to your planner file.
                        (use Chrome)
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
                    {errorMessage ? (
                        <p className="text-sm text-destructive">{errorMessage}</p>
                    ) : null}
                </CardContent>
            </Card>
        );
    }

    if (connectionStatus === "fallback_mode") {
        return (
            <Card className="border-border bg-secondary text-secondary-foreground">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-4" aria-hidden="true" />
                        Direct Saving Unavailable
                    </CardTitle>
                    <CardDescription>
                        This browser does not support direct local file saving. Export a
                        JSON backup to keep your planner data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                        type="button"
                        onClick={exportJsonBackup}
                        disabled={!data || isLoading}
                    >
                        <Download aria-hidden="true" />
                        Export JSON Backup
                    </Button>
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
                <CardTitle>Connect Planner File</CardTitle>
                <CardDescription>
                    Create a new local JSON planner file or open an existing one.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                    type="button"
                    onClick={() => void runAction(createNewPlanner)}
                    disabled={isLoading}
                >
                    <FilePlus2 aria-hidden="true" />
                    Create New Planner
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => void runAction(openExistingPlanner)}
                    disabled={isLoading}
                >
                    <FolderOpen aria-hidden="true" />
                    Open Existing Planner
                </Button>
                {errorMessage ? (
                    <p className="text-sm text-destructive">{errorMessage}</p>
                ) : null}
            </CardContent>
        </Card>
    );
}
