import { NextResponse } from "next/server";
import { db, broadcastNudge } from "@/lib/supabase";
import { requireHost } from "@/lib/hostAuth";
import { getSession, getQuestions, writeSessionState, NotFoundError } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Start a fresh game: back to the lobby with a clean slate.
 *
 * Clears every answer, so all scores go back to zero, and brings back any
 * question that was skipped or voided in the last run. Players stay joined
 * (they are waiting in the lobby) unless `clear_players` is set.
 *
 * Destructive, so the host UI downloads a CSV of the results first.
 */
export async function POST(req: Request) {
  const denied = await requireHost();
  if (denied) return denied;

  try {
    const body = (await req.json().catch(() => ({}))) as { clear_players?: unknown };
    const clearPlayers = body.clear_players === true;

    const session = await getSession();
    const questions = await getQuestions(session.id);
    const ids = questions.map((q) => q.id);

    if (ids.length > 0) {
      const { error: aErr } = await db().from("answers").delete().in("question_id", ids);
      if (aErr) throw aErr;

      const { error: qErr } = await db()
        .from("questions")
        .update({ skipped: false, voided: false })
        .eq("session_id", session.id);
      if (qErr) throw qErr;
    }

    if (clearPlayers) {
      const { error: pErr } = await db()
        .from("participants")
        .delete()
        .eq("session_id", session.id);
      if (pErr) throw pErr;
    }

    const written = await writeSessionState(session.id, {
      phase: "IDLE",
      status: "lobby",
      currentQuestionId: null,
      durationSec: null,
      leaderboardShownAfter: 0,
    });

    await broadcastNudge(session.code, written.state_version);

    return NextResponse.json({ ok: true, state_version: written.state_version });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error("[/api/host/reset]", err);
    return NextResponse.json({ error: "Could not reset the quiz." }, { status: 500 });
  }
}
