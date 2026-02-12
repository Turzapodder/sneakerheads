import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let socket: Socket | null = null;

export interface Drop {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  imageUrl: string;
  price: number;
  totalStock: number;
  availableStock: number;
  soldStock: number;
  reservedStock?: number;
  dropStartTime: string;
  dropEndTime?: string;
  status: "upcoming" | "live" | "ended" | "cancelled";
  isActive: boolean;
  category?: string;
  brand?: string;
  colorway?: string;
  releaseYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockUpdate {
  dropId: string;
  totalStock: number;
  availableStock: number;
  soldStock: number;
  reservedStock?: number;
  timestamp: string;
}

/**
 * Hook to manage Socket.IO connection and real-time drop updates
 */
export const useDropSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [drops, setDrops] = useState<Drop[]>([]);

  // Initialize socket connection
  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        console.log("✅ WebSocket connected:", socket?.id);
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("❌ WebSocket disconnected");
        setIsConnected(false);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ WebSocket connection error:", error);
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect on unmount to maintain connection across tab switches
      // socket?.disconnect();
    };
  }, []);

  // Handle stock updates
  const handleStockUpdate = useCallback((update: StockUpdate) => {
    console.log("📊 Stock update received:", update);

    setDrops((prevDrops) =>
      prevDrops.map((drop) =>
        drop.id === update.dropId
          ? {
              ...drop,
              totalStock: update.totalStock,
              availableStock: update.availableStock,
              soldStock: update.soldStock,
              reservedStock: update.reservedStock || 0,
              updatedAt: update.timestamp,
            }
          : drop,
      ),
    );
  }, []);

  // Handle new drop creation
  const handleDropCreated = useCallback(
    (data: { drop: Drop; timestamp: string }) => {
      console.log("🆕 New drop created:", data.drop);

      setDrops((prevDrops) => {
        // Check if drop already exists
        const exists = prevDrops.some((d) => d.id === data.drop.id);
        if (exists) return prevDrops;

        return [...prevDrops, data.drop];
      });
    },
    [],
  );

  // Handle drop updates
  const handleDropUpdated = useCallback(
    (data: { drop: Drop; timestamp: string }) => {
      console.log("🔄 Drop updated:", data.drop);

      setDrops((prevDrops) =>
        prevDrops.map((drop) =>
          drop.id === data.drop.id ? { ...drop, ...data.drop } : drop,
        ),
      );
    },
    [],
  );

  // Handle drop deletion
  const handleDropDeleted = useCallback(
    (data: { dropId: string; timestamp: string }) => {
      console.log("🗑️ Drop deleted:", data.dropId);

      setDrops((prevDrops) =>
        prevDrops.filter((drop) => drop.id !== data.dropId),
      );
    },
    [],
  );

  // Handle reservation created
  const handleReservationCreated = useCallback((data: any) => {
    console.log("🔖 Reservation created:", data);
    // Stock will be updated via stock-updated event
  }, []);

  // Handle reservation expired
  const handleReservationExpired = useCallback((data: any) => {
    console.log("⏰ Reservation expired:", data);
    // Stock will be updated via stock-recovered event
  }, []);

  // Handle reservation completed
  const handleReservationCompleted = useCallback((data: any) => {
    console.log("✅ Reservation completed:", data);
    // Stock will be updated via stock-updated event
  }, []);

  // Handle stock recovered (from expired/cancelled reservations)
  const handleStockRecovered = useCallback((update: StockUpdate) => {
    console.log("♻️ Stock recovered:", update);
    // Update drops with recovered stock
    setDrops((prevDrops) =>
      prevDrops.map((drop) =>
        drop.id === update.dropId
          ? {
              ...drop,
              availableStock: update.availableStock,
              reservedStock: update.reservedStock || 0,
              updatedAt: update.timestamp,
            }
          : drop,
      ),
    );
  }, []);

  // Subscribe to socket events
  useEffect(() => {
    if (!socket) return;

    socket.on("stock-updated", handleStockUpdate);
    socket.on("drop-created", handleDropCreated);
    socket.on("drop-updated", handleDropUpdated);
    socket.on("drop-deleted", handleDropDeleted);
    socket.on("reservation-created", handleReservationCreated);
    socket.on("reservation-expired", handleReservationExpired);
    socket.on("reservation-completed", handleReservationCompleted);
    socket.on("stock-recovered", handleStockRecovered);

    return () => {
      socket?.off("stock-updated", handleStockUpdate);
      socket?.off("drop-created", handleDropCreated);
      socket?.off("drop-updated", handleDropUpdated);
      socket?.off("drop-deleted", handleDropDeleted);
      socket?.off("reservation-created", handleReservationCreated);
      socket?.off("reservation-expired", handleReservationExpired);
      socket?.off("reservation-completed", handleReservationCompleted);
      socket?.off("stock-recovered", handleStockRecovered);
    };
  }, [
    handleStockUpdate,
    handleDropCreated,
    handleDropUpdated,
    handleDropDeleted,
    handleReservationCreated,
    handleReservationExpired,
    handleReservationCompleted,
    handleStockRecovered,
  ]);

  // Fetch initial drops data
  const fetchDrops = useCallback(async (status?: string) => {
    try {
      const url = status
        ? `${SOCKET_URL}/api/drops/${status}`
        : `${SOCKET_URL}/api/drops`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setDrops(data.data);
      }
    } catch (error) {
      console.error("❌ Error fetching drops:", error);
    }
  }, []);

  // Manually refetch drops (useful for syncing with manual DB changes)
  const refetchDrops = useCallback(
    async (status?: string) => {
      console.log("🔄 Manually refreshing drops...");
      await fetchDrops(status);
    },
    [fetchDrops],
  );

  // Join a specific drop room for targeted updates
  const joinDropRoom = useCallback((dropId: string) => {
    socket?.emit("join-drop", dropId);
  }, []);

  // Leave a specific drop room
  const leaveDropRoom = useCallback((dropId: string) => {
    socket?.emit("leave-drop", dropId);
  }, []);

  return {
    socket,
    isConnected,
    drops,
    setDrops,
    fetchDrops,
    refetchDrops,
    joinDropRoom,
    leaveDropRoom,
  };
};
