"use client";

import { useState, useCallback } from "react";
import { ordersApi, bakeryApi } from "@/lib/api";
import type { Order } from "@cakeday/shared";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (params?: Record<string, string | number | boolean | undefined>) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await ordersApi.list(params);
        setOrders(res.data);
        setTotalCount(res.meta.totalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Siparişler yüklenemedi.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createOrder = useCallback(async (data: unknown) => {
    const res = await ordersApi.create(data);
    return res.data;
  }, []);

  const cancelOrder = useCallback(async (id: string) => {
    const res = await ordersApi.cancel(id);
    return res.data;
  }, []);

  return {
    orders,
    totalCount,
    isLoading,
    error,
    fetchOrders,
    createOrder,
    cancelOrder,
  };
}

export function useBakeryOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (params?: Record<string, string | number | boolean | undefined>) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await bakeryApi.orders(params);
        setOrders(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Siparişler yüklenemedi.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const acceptOrder = useCallback(async (id: string) => {
    const res = await bakeryApi.acceptOrder(id);
    return res.data;
  }, []);

  const rejectOrder = useCallback(async (id: string, reason: string) => {
    const res = await bakeryApi.rejectOrder(id, reason);
    return res.data;
  }, []);

  const markDelivered = useCallback(async (id: string) => {
    const res = await bakeryApi.markDelivered(id);
    return res.data;
  }, []);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    acceptOrder,
    rejectOrder,
    markDelivered,
  };
}
