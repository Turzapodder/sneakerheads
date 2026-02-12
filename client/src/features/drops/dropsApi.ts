import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { io, Socket } from "socket.io-client";
import type { Drop, StockUpdate } from "@/types/drop";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const dropsApi = createApi({
  reducerPath: "dropsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${SOCKET_URL}/api`,
    prepareHeaders: (headers) => {
      // Token management should be handled by the caller or a custom wrapper
      return headers;
    },
  }),
  tagTypes: ["Drops", "Reservations"],
  endpoints: (builder) => ({
    getDrops: builder.query<Drop[], string>({
      query: (status = "live") => `/drops/${status}`,
      transformResponse: (response: { success: boolean; data: Drop[] }) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Drops" as const, id })),
              { type: "Drops", id: "LIST" },
            ]
          : [{ type: "Drops", id: "LIST" }],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        let socket: Socket;

        try {
          await cacheDataLoaded;

          socket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
          });

          socket.on("stock-updated", (update: StockUpdate) => {
            updateCachedData((draft) => {
              const drop = draft.find((d) => d.id === update.dropId);
              if (drop) {
                drop.totalStock = update.totalStock;
                drop.availableStock = update.availableStock;
                drop.soldStock = update.soldStock;
                drop.reservedStock = update.reservedStock;
                drop.updatedAt = update.timestamp;
              }
            });
          });

          socket.on("drop-created", (data: { drop: Drop }) => {
            updateCachedData((draft) => {
              // Check if it matches the current filter (e.g. 'live')
              if (arg === "live" && data.drop.status !== "live") return;
              const exists = draft.find((d) => d.id === data.drop.id);
              if (!exists) {
                draft.push(data.drop);
              }
            });
          });

          socket.on("drop-updated", (data: { drop: Drop }) => {
            updateCachedData((draft) => {
              const index = draft.findIndex((d) => d.id === data.drop.id);
              if (index !== -1) {
                draft[index] = { ...draft[index], ...data.drop };
              }
            });
          });

          socket.on("drop-deleted", (data: { dropId: string }) => {
            updateCachedData((draft) => {
              return draft.filter((d) => d.id !== data.dropId);
            });
          });

          socket.on("stock-recovered", (update: StockUpdate) => {
            updateCachedData((draft) => {
              const drop = draft.find((d) => d.id === update.dropId);
              if (drop) {
                drop.availableStock = update.availableStock;
                drop.reservedStock = update.reservedStock;
                drop.updatedAt = update.timestamp;
              }
            });
          });

          socket.on("purchase-created", (data: { purchase: any }) => {
            updateCachedData((draft) => {
              const drop = draft.find((d) => d.id === data.purchase.dropId);
              if (drop) {
                // Initialize array if it doesn't exist
                if (!drop.purchases) {
                  drop.purchases = [];
                }

                // Add new purchase to the beginning if not already there
                if (!drop.purchases.some((p) => p.id === data.purchase.id)) {
                  drop.purchases.unshift(data.purchase);
                  // Keep only top 3
                  if (drop.purchases.length > 3) {
                    drop.purchases = drop.purchases.slice(0, 3);
                  }
                }
              }
            });
          });
        } catch (err) {
          console.error("Socket init error", err);
        }

        await cacheEntryRemoved;
        if (socket!) {
          socket.disconnect();
        }
      },
    }),
    reserveDrop: builder.mutation<
      { success: boolean; data: any },
      { dropId: string; token: string }
    >({
      query: ({ dropId, token }) => ({
        url: `/drops/${dropId}/reserve`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["Reservations"],
    }),
    purchaseDrop: builder.mutation<
      { success: boolean; data: any },
      { reservationId: string; token: string }
    >({
      query: ({ reservationId, token }) => ({
        url: `/reservations/${reservationId}/purchase`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["Reservations", "Drops"],
    }),
    cancelReservation: builder.mutation<
      { success: boolean },
      { reservationId: string; token: string }
    >({
      query: ({ reservationId, token }) => ({
        url: `/reservations/${reservationId}/cancel`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["Reservations"],
    }),
    getMyReservations: builder.query<any, string>({
      query: (token) => ({
        url: "/reservations/my-reservations",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["Reservations"],
    }),
  }),
});

export const {
  useGetDropsQuery,
  useReserveDropMutation,
  usePurchaseDropMutation,
  useCancelReservationMutation,
  useGetMyReservationsQuery,
} = dropsApi;
