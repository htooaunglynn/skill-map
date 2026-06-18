"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressNoteFormDialog } from "@/src/components/progress-notes/ProgressNoteFormDialog";
import { usePlanner } from "@/src/context/PlannerContext";
import { usePageAnimation } from "@/src/hooks/usePageAnimation";

const chipClass =
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider";

export const runtime = 'edge';

export default function ProgressNoteDetailPage({
    params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
    const { id } = use(params);
    const { data, loadData } = usePlanner();
    const pageRef = usePageAnimation();
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => { void loadData(); }, [loadData]);

    const note = data?.progress_notes.find((n) => n.id === id) ?? null;
    const goal = useMemo(
        () => (note ? data?.goals.find((g) => g.id === note.goal_id) : undefined),
        [data?.goals, note],
    );
    const milestone = useMemo(
        () => (note?.milestone_id ? data?.milestones.find((m) => m.id === note.milestone_id) : undefined),
        [data?.milestones, note],
    );
    const session = useMemo(
        () => (note?.session_id ? data?.practice_sessions.find((s) => s.id === note.session_id) : undefined),
        [data?.practice_sessions, note],
    );

    return (
        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--sm-bg)", color: "var(--sm-text)" }}>
            <div ref={pageRef} className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                <Link
                    href="/app/progress-notes"
                    className="inline-flex h-9 w-fit items-center gap-1.5 px-3 font-mono text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-70"
                    style={{ color: "var(--sm-muted)" }}
                >
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    All Notes
                </Link>

                {note ? (
                    <>
                        <section className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                                <h1 className="text-3xl font-bold">{note.title}</h1>
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                                    <Pencil aria-hidden="true" />
                                    Edit
                                </Button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {goal ? (
                                    <span className={chipClass} style={{ borderColor: "var(--sm-border)", color: "var(--sm-muted)" }}>
                                        {goal.title}
                                    </span>
                                ) : null}
                                {milestone ? (
                                    <span className={chipClass} style={{ borderColor: "var(--sm-border)", color: "var(--sm-muted)" }}>
                                        {milestone.title}
                                    </span>
                                ) : null}
                                {session ? (
                                    <span className={chipClass} style={{ borderColor: "var(--sm-border)", color: "var(--sm-muted)" }}>
                                        {session.title}
                                    </span>
                                ) : null}
                            </div>
                            <p className="font-mono text-xs" style={{ color: "var(--sm-muted)" }}>
                                Created {new Date(note.created_at).toLocaleString()} · Updated{" "}
                                {new Date(note.updated_at).toLocaleString()}
                            </p>
                        </section>

                        <article
                            className="whitespace-pre-wrap rounded-xl border p-6 text-sm leading-relaxed"
                            style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)", color: "var(--sm-text)" }}
                        >
                            {note.content || "This note has no content yet."}
                        </article>

                        <ProgressNoteFormDialog note={note} open={isEditOpen} onOpenChange={setIsEditOpen} />
                    </>
                ) : (
                    <div className="rounded-xl border p-8 text-center" style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}>
                        <p className="font-semibold">Note not found</p>
                        <p className="mt-1 text-sm" style={{ color: "var(--sm-muted)" }}>
                            Open a planner file or choose another note.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
