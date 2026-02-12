import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import type { Drop } from "@/types/drop";
import type { Reservation } from "@/types/reservation";

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSneaker: Drop | null;
    currentReservation: Reservation | null;
    countdown: number;
    error: string;
    isPurchasing: boolean;
    onCompletePurchase: () => void;
}

export function ReservationModal({
    isOpen,
    onClose,
    selectedSneaker,
    currentReservation,
    countdown,
    error,
    isPurchasing,
    onCompletePurchase
}: ReservationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                        onClick={onClose}
                        disabled={isPurchasing}
                        className="border-2"
                    >
                        Close
                    </Button>
                    {currentReservation ? (
                        <Button
                            onClick={onCompletePurchase}
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
    );
}
