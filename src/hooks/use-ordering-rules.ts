"use client";

import { useState, useCallback } from "react";
import { rulesApi } from "@/lib/api";
import type { OrderingRule } from "@cakeday/shared";

export function useOrderingRules() {
  const [rules, setRules] = useState<OrderingRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await rulesApi.list();
      setRules(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kurallar yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRule = useCallback(async (data: Partial<OrderingRule>) => {
    const res = await rulesApi.create(data);
    return res.data;
  }, []);

  const updateRule = useCallback(async (id: string, data: Partial<OrderingRule>) => {
    const res = await rulesApi.update(id, data);
    return res.data;
  }, []);

  const deleteRule = useCallback(async (id: string) => {
    await rulesApi.delete(id);
  }, []);

  return {
    rules,
    isLoading,
    error,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
  };
}
