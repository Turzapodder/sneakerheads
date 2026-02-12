import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useLiveDrops } from "../hooks/useLiveDrops";
import { DropsHeader } from "./DropsHeader";
import { DropsStats } from "./DropsStats";
import { ActiveReservations } from "./ActiveReservations";
import { DropsTable } from "./DropsTable";
import { ReservationModal } from "./ReservationModal";

export function LiveDrops() {
    const {
        drops,
        myReservations,
        isDropsLoading,
        isDropsError,
        dropsError,
        refetchDrops,
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
        openForExistingReservation
    } = useLiveDrops();

    if (isDropsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto mb-4" />
                    <p className="text-lg font-semibold">Loading drops...</p>
                </div>
            </div>
        );
    }

    if (isDropsError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200 max-w-md mx-4">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-lg font-bold text-red-700 mb-2">Error Loading Drops</p>
                    <p className="text-sm text-red-600 mb-6 break-all">
                        {dropsError ? (
                            // @ts-ignore
                            dropsError.data?.message || dropsError.error || JSON.stringify(dropsError)
                        ) : "Failed to connect to the server. Please check your connection."}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="bg-white border-red-200 text-red-700 hover:bg-red-50"
                        >
                            Reload Page
                        </Button>
                        <Button
                            onClick={() => refetchDrops()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Retry Request
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DropsHeader
                lastRefresh={lastRefresh}
                isRefreshing={isRefreshing}
                onRefresh={handleManualRefresh}
            />

            <ActiveReservations
                reservations={myReservations}
                drops={drops}
                onCompletePurchase={openForExistingReservation}
                onCancelReservation={handleCancelReservation}
            />

            <DropsStats drops={drops} />

            <DropsTable
                drops={drops}
                myReservations={myReservations}
                reservingDropId={reservingDropId}
                onReserve={handleReserve}
            />

            <ReservationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedSneaker={selectedSneaker}
                currentReservation={currentReservation}
                countdown={countdown}
                error={error}
                isPurchasing={isPurchasing}
                onCompletePurchase={handleCompletePurchase}
            />
        </div>
    );
}
