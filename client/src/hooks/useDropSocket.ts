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

  // Subscribe to socket events
  useEffect(() => {
    if (!socket) return;

    socket.on("stock-updated", handleStockUpdate);
    socket.on("drop-created", handleDropCreated);
    socket.on("drop-updated", handleDropUpdated);
    socket.on("drop-deleted", handleDropDeleted);

    return () => {
      socket?.off("stock-updated", handleStockUpdate);
      socket?.off("drop-created", handleDropCreated);
      socket?.off("drop-updated", handleDropUpdated);
      socket?.off("drop-deleted", handleDropDeleted);
    };
  }, [
    handleStockUpdate,
    handleDropCreated,
    handleDropUpdated,
    handleDropDeleted,
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
    joinDropRoom,
    leaveDropRoom,
  };
};
