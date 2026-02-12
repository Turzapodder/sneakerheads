import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ShoppingBag, Package, RefreshCw, AlertCircle, User } from "lucide-react";
import { useDropSocket, type Drop } from "@/hooks/useDropSocket";
import type { Reservation } from "@/types/reservation";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to get username from user data
const getUsername = (user: { firstName?: string; lastName?: string; clerkId: string }) => {
    if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
        return user.firstName;
    } else if (user.lastName) {
        return user.lastName;
    }
    return user.clerkId.substring(0, 8);
};

export function LiveDrops() {
    const { getToken } = useAuth();
    const { isConnected, drops, setDrops, fetchDrops, refetchDrops } = useDropSocket();
    const [selectedSneaker, setSelectedSneaker] = useState<Drop | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [isReserving, setIsReserving] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [myReservations, setMyReservations] = useState<Reservation[]>([]);
    const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
    const [error, setError] = useState<string>("");

    // Fetch live drops on mount
    useEffect(() => {
        const loadDrops = async () => {
            setIsLoading(true);
            await fetchDrops('live');
            setIsLoading(false);
            setLastRefresh(new Date());
        };
        loadDrops();
    }, [fetchDrops]);

    // Fetch user's active reservations
    const fetchMyReservations = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/reservations/my-reservations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setMyReservations(data.data);
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
        }
    };

    // Load reservations on mount and after operations
    useEffect(() => {
        fetchMyReservations();
        // No polling needed - WebSocket handles real-time updates
    }, [getToken]);

    // Auto-refresh drops every 30 seconds to sync with database changes
    useEffect(() => {
        const interval = setInterval(async () => {
            console.log('Auto-refreshing drops...');
            await refetchDrops('live');
            setLastRefresh(new Date());
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [refetchDrops]);

    // Countdown timer for current reservation
    useEffect(() => {
        if (!currentReservation || currentReservation.status !== 'active') return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expiresAt = new Date(currentReservation.expiresAt).getTime();
            const remaining = Math.floor((expiresAt - now) / 1000);

            if (remaining <= 0) {
                setCountdown(0);
                setCurrentReservation(null);
                fetchMyReservations();
                clearInterval(interval);
            } else {
                setCountdown(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentReservation]);

    // Manual refresh handler
    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        await refetchDrops('live');
        await fetchMyReservations();
        setLastRefresh(new Date());
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const handleReserve = async (sneaker: Drop) => {
        if (sneaker.availableStock === 0) return;

        // Check if user already has a reservation for this drop
        const existingReservation = myReservations.find(r => r.dropId === sneaker.id);
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

        setError("");
        setIsReserving(true);

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/drops/${sneaker.id}/reserve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success && data.data) {
                // Update local state immediately
                setDrops(prevDrops =>
                    prevDrops.map(drop =>
                        drop.id === sneaker.id
                            ? {
                                ...drop,
                                availableStock: data.data.drop.availableStock,
                                reservedStock: data.data.drop.reservedStock
                            }
                            : drop
                    )
                );

                setCurrentReservation(data.data.reservation);
                setSelectedSneaker(sneaker);
                setIsModalOpen(true);
                setCountdown(60);
                await fetchMyReservations();
            } else {
                throw new Error(data.message || 'Failed to reserve sneaker');
            }
        } catch (error) {
            console.error('Error reserving sneaker:', error);
            setError(error instanceof Error ? error.message : 'Failed to create reservation');
            alert(`Failed to reserve: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsReserving(false);
        }
    };

    const handleCompletePurchase = async () => {
        if (!currentReservation) return;

        setError("");
        setIsPurchasing(true);

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/reservations/${currentReservation.id}/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success && data.data) {
                // Update local state
                if (selectedSneaker) {
                    setDrops(prevDrops =>
                        prevDrops.map(drop =>
                            drop.id === selectedSneaker.id
                                ? {
                                    ...drop,
                                    soldStock: data.data.drop.soldStock,
                                    reservedStock: data.data.drop.reservedStock,
                                    availableStock: data.data.drop.availableStock
                                }
                                : drop
                        )
                    );
                }

                setTimeout(() => {
                    setIsModalOpen(false);
                    setCurrentReservation(null);
                    setIsPurchasing(false);
                    fetchMyReservations();
                    refetchDrops('live'); // Refresh to get updated recent buyers
                    alert(`Successfully purchased ${selectedSneaker?.name}!`);
                }, 500);
            } else {
                throw new Error(data.message || 'Failed to complete purchase');
            }
        } catch (error) {
            console.error('Error completing purchase:', error);
            setError(error instanceof Error ? error.message : 'Failed to complete purchase');
            setIsPurchasing(false);
        }
    };

    const handleCancelReservation = async (reservationId: string) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/reservations/${reservationId}/cancel`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                await fetchMyReservations();
                await refetchDrops('live');
                if (currentReservation?.id === reservationId) {
                    setCurrentReservation(null);
                    setIsModalOpen(false);
                }
            } else {
                throw new Error(data.message || 'Failed to cancel reservation');
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            alert(`Failed to cancel: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSneaker(null);
        setCurrentReservation(null);
        setCountdown(60);
        setError("");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto mb-4" />
                    <p className="text-lg font-semibold">Loading drops...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-green-500 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Live Sneaker Drops</h2>
                        <p className="text-purple-100">
                            Limited edition sneakers available now. Reserve yours before they're gone!
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`} />
                                <span className="text-sm font-medium">
                                    {isConnected ? 'Live Updates' : 'Disconnected'}
                                </span>
                            </div>
                            <div className="text-[11px] text-purple-100/80">
                                Last sync: {lastRefresh.toLocaleTimeString()}
                            </div>
                        </div>
                        <Button
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            variant="secondary"
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* My Active Reservations */}
            {myReservations.length > 0 && (
                <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-600" />
                            My Active Reservations ({myReservations.length})
                        </h3>
                        <div className="space-y-3">
                            {myReservations.map((reservation) => {
                                const now = new Date().getTime();
                                const expiresAt = new Date(reservation.expiresAt).getTime();
                                const remaining = Math.floor((expiresAt - now) / 1000);
                                const minutesLeft = Math.floor(remaining / 60);
                                const secondsLeft = remaining % 60;

                                return (
                                    <div key={reservation.id} className="bg-white p-4 rounded-lg border-2 border-purple-200 flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            {reservation.drop && (
                                                <>
                                                    <img
                                                        src={reservation.drop.imageUrl}
                                                        alt={reservation.drop.name}
                                                        className="h-16 w-16 rounded-lg object-cover border-2 border-purple-300"
                                                    />
                                                    <div>
                                                        <h4 className="font-semibold">{reservation.drop.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            ${Number(reservation.drop.price).toFixed(2)}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Clock className="h-3 w-3 text-orange-600" />
                                                            <span className={`text-sm font-semibold ${remaining <= 10 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
                                                                {remaining > 0 ? `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')} left` : 'Expired'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => {
                                                    const drop = drops.find(d => d.id === reservation.dropId);
                                                    if (drop) {
                                                        setSelectedSneaker(drop);
                                                        setCurrentReservation(reservation);
                                                        setCountdown(remaining > 0 ? remaining : 0);
                                                        setIsModalOpen(true);
                                                    }
                                                }}
                                                disabled={remaining <= 0}
                                                className="bg-green-500 hover:bg-green-600 text-white"
                                            >
                                                Complete Purchase
                                            </Button>
                                            <Button
                                                onClick={() => handleCancelReservation(reservation.id)}
                                                variant="outline"
                                                className="border-red-300 text-red-600 hover:bg-red-50"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-2 border-blue-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Drops</p>
                                <p className="text-2xl font-bold text-blue-600">{drops.length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-2 border-green-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Available</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {drops.filter((s) => s.availableStock > 0).length}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-2 border-red-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {drops.filter((s) => s.availableStock === 0).length}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sneakers Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-slate-100">
                    <h3 className="text-xl font-bold">Available Sneaker Drops</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Browse and reserve limited edition sneakers
                    </p>
                </div>
                {drops.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-gray-600">No live drops available</p>
                        <p className="text-sm text-gray-500 mt-1">Check back soon for new releases!</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-slate-50/50">
                                <TableHead className="w-[400px] font-semibold">Sneaker</TableHead>
                                <TableHead className="font-semibold">Price</TableHead>
                                <TableHead className="font-semibold">Live Stock Count</TableHead>
                                <TableHead className="font-semibold">Total Stock</TableHead>
                                <TableHead className="font-semibold">Recent Buyers</TableHead>
                                <TableHead className="text-right font-semibold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drops.map((sneaker) => {
                                const hasReservation = myReservations.some(r => r.dropId === sneaker.id);
                                return (
                                    <TableRow
                                        key={sneaker.id}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img
                                                        src={sneaker.imageUrl}
                                                        alt={sneaker.name}
                                                        className="h-16 w-16 rounded-lg object-cover bg-slate-100 border-2 border-slate-200 group-hover:border-slate-300 transition-all group-hover:shadow-md"
                                                    />
                                                    {sneaker.availableStock > 0 && sneaker.availableStock < 15 && (
                                                        <Badge className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-500 text-[10px] px-1.5 py-0.5">
                                                            HOT
                                                        </Badge>
                                                    )}
                                                    {hasReservation && (
                                                        <Badge className="absolute -top-2 -right-2 bg-purple-500 hover:bg-purple-500 text-[10px] px-1.5 py-0.5">
                                                            RESERVED
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm leading-tight">
                                                        {sneaker.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        {sneaker.brand || 'Limited Edition'}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-lg text-slate-900">
                                                ${Number(sneaker.price).toFixed(2)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {sneaker.availableStock === 0 ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-red-100 text-red-700 hover:bg-red-100 font-semibold"
                                                >
                                                    Out of Stock
                                                </Badge>
                                            ) : sneaker.availableStock < 15 ? (
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-orange-100 text-orange-700 hover:bg-orange-100 font-semibold animate-pulse"
                                                    >
                                                        {sneaker.availableStock} left
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-green-100 text-green-700 hover:bg-green-100 font-semibold"
                                                >
                                                    {sneaker.availableStock} available
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-lg text-slate-900">
                                                {sneaker.totalStock}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {sneaker.purchases && sneaker.purchases.length > 0 ? (
                                                    sneaker.purchases.slice(0, 3).map((purchase) => (
                                                        <div key={purchase.id} className="flex items-center gap-2">
                                                            {purchase.user.profileImageUrl ? (
                                                                <img
                                                                    src={purchase.user.profileImageUrl}
                                                                    alt={getUsername(purchase.user)}
                                                                    className="h-6 w-6 rounded-full border border-slate-300"
                                                                />
                                                            ) : (
                                                                <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center border border-purple-300">
                                                                    <User className="h-3 w-3 text-purple-600" />
                                                                </div>
                                                            )}
                                                            <span className="text-xs font-medium text-slate-700">
                                                                {getUsername(purchase.user)}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        No purchases yet
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                onClick={() => handleReserve(sneaker)}
                                                disabled={sneaker.availableStock === 0 || isReserving}
                                                className={`${hasReservation ? 'bg-purple-500 hover:bg-purple-600' : 'bg-[#90EE90] hover:bg-[#7CDA7C]'} text-slate-900 font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                                size="sm"
                                            >
                                                {isReserving ? (
                                                    <>
                                                        <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                                                        Reserving...
                                                    </>
                                                ) : sneaker.availableStock === 0 ? (
                                                    "Sold Out"
                                                ) : hasReservation ? (
                                                    "View Reservation"
                                                ) : (
                                                    "Reserve"
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Reservation Modal */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {currentReservation ? 'Complete Your Purchase' : 'Confirm Your Reservation'}
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            {currentReservation ? 'You have reserved this item. Complete your purchase before time runs out!' : 'Review your selection and confirm to reserve'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSneaker && (
                        <div className="space-y-6 py-4">
                            {/* Countdown Timer */}
                            <div className="flex items-center justify-center">
                                <div className="relative">
                                    <div
                                        className={`h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold ${countdown <= 10
                                            ? "bg-red-100 text-red-600 animate-pulse"
                                            : countdown <= 30
                                                ? "bg-orange-100 text-orange-600"
                                                : "bg-green-100 text-green-600"
                                            }`}
                                    >
                                        {countdown}
                                    </div>

                                </div>
                            </div>

                            {/* Sneaker Details */}
                            <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                                <div className="flex gap-4">
                                    <img
                                        src={selectedSneaker.imageUrl}
                                        alt={selectedSneaker.name}
                                        className="h-24 w-24 rounded-lg object-cover border-2 border-slate-300"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg mb-2">
                                            {selectedSneaker.name}
                                        </h4>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Price:</span>
                                                <span className="font-bold text-lg">
                                                    ${Number(selectedSneaker.price).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Stock Available:
                                                </span>
                                                <span className="font-semibold">
                                                    {selectedSneaker.availableStock} pairs
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                    <p className="text-red-700 font-semibold text-sm">{error}</p>
                                </div>
                            )}

                            {/* Warning Message */}
                            {countdown <= 10 && countdown > 0 && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center animate-pulse">
                                    <p className="text-red-700 font-semibold text-sm">
                                        Time is running out! Complete your purchase now or lose your reservation
                                    </p>
                                </div>
                            )}

                            {/* Expired Message */}
                            {countdown === 0 && (
                                <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-3 text-center">
                                    <p className="text-gray-700 font-semibold text-sm">
                                        Reservation has expired. The item has been returned to available stock.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCloseModal}
                            disabled={isPurchasing}
                            className="border-2"
                        >
                            Close
                        </Button>
                        {currentReservation ? (
                            <Button
                                onClick={handleCompletePurchase}
                                disabled={countdown === 0 || isPurchasing}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg disabled:opacity-50"
                            >
                                {isPurchasing ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Processing...
                                    </>
                                ) : countdown === 0 ? (
                                    "Reservation Expired"
                                ) : (
                                    "Complete Purchase"
                                )}
                            </Button>
                        ) : null}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
