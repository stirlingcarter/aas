import { useCallback, useEffect, useState } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Commitment, Verification, Appeal, CommitmentWithVerification } from '../types';

export function useCommitments() {
  const { user } = useAuth();
  const [commitments, setCommitments] = useState<CommitmentWithVerification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommitments = useCallback(async () => {
    if (!user || !isConfigured()) {
      setCommitments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: cmts } = await supabase
      .from('commitments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!cmts) {
      setLoading(false);
      return;
    }

    const ids = cmts.map((c: Commitment) => c.id);

    const [{ data: verifications }, { data: appeals }] = await Promise.all([
      supabase.from('verifications').select('*').in('commitment_id', ids),
      supabase.from('appeals').select('*').in('commitment_id', ids),
    ]);

    const verMap = new Map((verifications ?? []).map((v: Verification) => [v.commitment_id, v]));
    const appMap = new Map((appeals ?? []).map((a: Appeal) => [a.commitment_id, a]));

    setCommitments(
      cmts.map((c: Commitment) => ({
        ...c,
        verification: verMap.get(c.id) ?? null,
        appeal: appMap.get(c.id) ?? null,
      }))
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCommitments();
  }, [fetchCommitments]);

  const createCommitment = useCallback(
    async (goal: string, amountCents: number, deadline: string) => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('commitments')
        .insert({
          user_id: user.id,
          goal_description: goal,
          amount_cents: amountCents,
          deadline,
          status: 'pending_payment',
        })
        .select()
        .single();

      if (error) throw error;
      await fetchCommitments();
      return data as Commitment;
    },
    [user, fetchCommitments]
  );

  const submitVerification = useCallback(
    async (commitmentId: string, achievementPct: number, description: string) => {
      const { error: vErr } = await supabase.from('verifications').insert({
        commitment_id: commitmentId,
        achievement_pct: achievementPct,
        description,
      });
      if (vErr) throw vErr;

      const reviewDelay = Math.floor(Math.random() * (72 - 24 + 1) + 24) * 60 * 60 * 1000;
      const reviewCompletedAt = new Date(Date.now() + reviewDelay).toISOString();

      const { error: cErr } = await supabase
        .from('commitments')
        .update({
          status: 'under_review',
          verified_at: new Date().toISOString(),
          review_completed_at: reviewCompletedAt,
        })
        .eq('id', commitmentId);
      if (cErr) throw cErr;

      await fetchCommitments();
    },
    [fetchCommitments]
  );

  const submitAppeal = useCallback(
    async (commitmentId: string, reason: string) => {
      const resolvedAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from('appeals').insert({
        commitment_id: commitmentId,
        reason,
        status: 'pending',
        resolved_at: resolvedAt,
      });
      if (error) throw error;
      await fetchCommitments();
    },
    [fetchCommitments]
  );

  return {
    commitments,
    loading,
    createCommitment,
    submitVerification,
    submitAppeal,
    refetch: fetchCommitments,
  };
}
