import { useState, useEffect } from "react";
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
import { Clock, ShoppingBag, Package } from "lucide-react";
import { useDropSocket, type Drop } from "@/hooks/useDropSocket";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function LiveDrops() {
    const { isConnected, drops, setDrops, fetchDrops } = useDropSocket();
    const [selectedSneaker, setSelectedSneaker] = useState<Drop | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch live drops on mount
    useEffect(() => {
        const loadDrops = async () => {
            setIsLoading(true);
            await fetchDrops('live');
            setIsLoading(false);
        };
        loadDrops();
    }, [fetchDrops]);

    const handleReserve = (sneaker: Drop) => {
        if (sneaker.availableStock === 0) return;
        setSelectedSneaker(sneaker);
        setIsModalOpen(true);
        setCountdown(10);
        setIsConfirming(false);
        startCountdown();
    };

    const startCountdown = () => {
        setCountdown(10);
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleConfirmPurchase = async () => {
        if (!selectedSneaker) return;

        setIsConfirming(true);

        try {
            // Call the stock update API
            const response = await fetch(`${API_URL}/api/drops/${selectedSneaker.id}/stock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth token if needed
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: 1 })
            });

            const data = await response.json();

            if (data.success) {
                // Update local state immediately (WebSocket will also update it)
                setDrops(prevDrops =>
                    prevDrops.map(drop =>
                        drop.id === selectedSneaker.id
                            ? {
                                ...drop,
                                availableStock: data.data.availableStock,
                                soldStock: data.data.soldStock
                            }
                            : drop
                    )
                );

                setTimeout(() => {
                    setIsModalOpen(false);
                    setIsConfirming(false);
                    alert(`Successfully reserved ${selectedSneaker.name}!`);
                }, 500);
            } else {
                throw new Error(data.message || 'Failed to reserve sneaker');
            }
        } catch (error) {
            console.error('Error reserving sneaker:', error);
            alert(`Failed to reserve: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsConfirming(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSneaker(null);
        setCountdown(10);
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
                    <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`} />
                        <span className="text-sm font-medium">
                            {isConnected ? 'Live Updates' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>

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
                                <TableHead className="text-right font-semibold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drops.map((sneaker) => (
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
                                    <TableCell className="text-right">
                                        <Button
                                            onClick={() => handleReserve(sneaker)}
                                            disabled={sneaker.availableStock === 0}
                                            className="bg-[#90EE90] hover:bg-[#7CDA7C] text-slate-900 font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            size="sm"
                                        >
                                            {sneaker.availableStock === 0 ? "Sold Out" : "Reserve"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Reservation Modal */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            Confirm Your Reservation
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Review your selection and confirm within the time limit
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSneaker && (
                        <div className="space-y-6 py-4">
                            {/* Countdown Timer */}
                            <div className="flex items-center justify-center">
                                <div className="relative">
                                    <div
                                        className={`h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold ${countdown <= 3
                                            ? "bg-red-100 text-red-600 animate-pulse"
                                            : countdown <= 6
                                                ? "bg-orange-100 text-orange-600"
                                                : "bg-green-100 text-green-600"
                                            }`}
                                    >
                                        {countdown}
                                    </div>
                                    <Clock
                                        className={`absolute -top-1 -right-1 h-6 w-6 ${countdown <= 3
                                            ? "text-red-600"
                                            : countdown <= 6
                                                ? "text-orange-600"
                                                : "text-green-600"
                                            }`}
                                    />
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

                            {/* Warning Message */}
                            {countdown <= 3 && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center animate-pulse">
                                    <p className="text-red-700 font-semibold text-sm">
                                        ⚠️ Time is running out! Confirm now or lose your spot
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCloseModal}
                            disabled={isConfirming}
                            className="border-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmPurchase}
                            disabled={countdown === 0 || isConfirming}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg disabled:opacity-50"
                        >
                            {isConfirming ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Confirming...
                                </>
                            ) : countdown === 0 ? (
                                "Time Expired"
                            ) : (
                                "Confirm Purchase"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
