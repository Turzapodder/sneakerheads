import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  useGetDropsQuery,
  useReserveDropMutation,
  usePurchaseDropMutation,
  useCancelReservationMutation,
  useGetMyReservationsQuery,
} from "../dropsApi";
import type { Drop } from "@/types/drop";
import type { Reservation } from "@/types/reservation";

export function useLiveDrops() {
  const { getToken, isLoaded } = useAuth();
  const [token, setToken] = useState<string>("");

  // Load token and refresh it periodically to prevent 401 errors
  useEffect(() => {
    const loadToken = async () => {
      if (isLoaded) {
        try {
          const t = await getToken();
          if (t) setToken(t);
        } catch (err) {
          console.error("Error fetching token:", err);
        }
      }
    };

    loadToken();

    // Refresh token every 45 seconds (Clerk tokens are short-lived)
    const interval = setInterval(loadToken, 30000);

    return () => clearInterval(interval);
  }, [getToken, isLoaded]);

  const {
    data: drops = [],
    isLoading: isDropsLoading,
    isError: isDropsError,
    error: dropsError,
    refetch: refetchDrops,
  } = useGetDropsQuery("live");

  const { data: myReservationsResponse, refetch: refetchReservations } =
    useGetMyReservationsQuery(token, { skip: !token });

  const [reserveDrop, { isLoading: isReserving }] = useReserveDropMutation();
  const [purchaseDrop, { isLoading: isPurchasing }] = usePurchaseDropMutation();
  const [cancelReservation] = useCancelReservationMutation();

  const myReservations: Reservation[] = myReservationsResponse?.data || [];

  const [selectedSneaker, setSelectedSneaker] = useState<Drop | null>(null);
  const [reservingDropId, setReservingDropId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [currentReservation, setCurrentReservation] =
    useState<Reservation | null>(null);
  const [error, setError] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Countdown timer for current reservation
  useEffect(() => {
    if (!currentReservation || currentReservation.status !== "active") return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(currentReservation.expiresAt).getTime();
      const remaining = Math.floor((expiresAt - now) / 1000);

      if (remaining <= 0) {
        setCountdown(0);
        setCurrentReservation(null);
        refetchReservations();
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentReservation, refetchReservations]);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchDrops(), refetchReservations()]);
    setLastRefresh(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleReserve = async (sneaker: Drop) => {
    // Get fresh token
    const freshToken = await getToken();
    if (!freshToken) return;

    if (sneaker.availableStock === 0) return;

    // Check if user already has a reservation for this drop
    const existingReservation = myReservations.find(
      (r) => r.dropId === sneaker.id,
    );
    if (existingReservation) {
      setCurrentReservation(existingReservation);
      setSelectedSneaker(sneaker);
      setIsModalOpen(true);
      const now = new Date().getTime();
      const expiresAt = new Date(existingReservation.expiresAt).getTime();
      const remaining = Math.floor((expiresAt - now) / 1000);
      setCountdown(remaining > 0 ? remaining : 0);
      return;
    }

    setReservingDropId(sneaker.id);
    setError("");

    try {
      const result = await reserveDrop({
        dropId: sneaker.id,
        token: freshToken,
      }).unwrap();

      if (result.success && result.data) {
        setCurrentReservation(result.data.reservation);
        setSelectedSneaker(sneaker);
        setIsModalOpen(true);
        setCountdown(60);
      }
    } catch (error: any) {
      console.error("Error reserving sneaker:", error);
      setError(error.data?.message || "Failed to create reservation");
    } finally {
      setReservingDropId(null);
    }
  };

  const handleCompletePurchase = async () => {
    if (!currentReservation) return;

    // Get fresh token
    const freshToken = await getToken();
    if (!freshToken) return;

    setError("");

    try {
      const result = await purchaseDrop({
        reservationId: currentReservation.id,
        token: freshToken,
      }).unwrap();

      if (result.success) {
        setTimeout(() => {
          setIsModalOpen(false);
          setCurrentReservation(null);
          // @ts-ignore
          alert(`Successfully purchased ${selectedSneaker?.name}!`); // Consider replacing with a toast
        }, 500);
      }
    } catch (error: any) {
      console.error("Error completing purchase:", error);
      setError(error.data?.message || "Failed to complete purchase");
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    // Get fresh token
    const freshToken = await getToken();
    if (!freshToken) return;

    try {
      await cancelReservation({ reservationId, token: freshToken }).unwrap();
      if (currentReservation?.id === reservationId) {
        setCurrentReservation(null);
        setIsModalOpen(false);
      }
    } catch (error: any) {
      console.error("Error cancelling reservation:", error);
      // @ts-ignore
      alert(`Failed to cancel: ${error.data?.message || "Unknown error"}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSneaker(null);
    setCurrentReservation(null);
    setCountdown(60);
    setError("");
  };

  const openForExistingReservation = (reservation: Reservation, drop: Drop) => {
    const now = new Date().getTime();
    const expiresAt = new Date(reservation.expiresAt).getTime();
    const remaining = Math.floor((expiresAt - now) / 1000);

    setSelectedSneaker(drop);
    setCurrentReservation(reservation);
    setCountdown(remaining > 0 ? remaining : 0);
    setIsModalOpen(true);
  };

  return {
    drops,
    myReservations,
    isDropsLoading,
    isDropsError,
    dropsError,
    refetchDrops,
    isReserving,
    reservingDropId,
    isPurchasing,
    selectedSneaker,
    isModalOpen,
    countdown,
    currentReservation,
    error,
    isRefreshing,
    lastRefresh,
    handleManualRefresh,
    handleReserve,
    handleCompletePurchase,
    handleCancelReservation,
    handleCloseModal,
    openForExistingReservation,
  };
}
