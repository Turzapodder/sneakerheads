import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import type { Reservation } from "@/types/reservation";
import type { Drop } from "@/types/drop";

interface ActiveReservationsProps {
    reservations: Reservation[];
    drops: Drop[];
    onCompletePurchase: (reservation: Reservation, drop: Drop) => void;
    onCancelReservation: (reservationId: string) => void;
}

export function ActiveReservations({
    reservations,
    drops,
    onCompletePurchase,
    onCancelReservation
}: ActiveReservationsProps) {
    if (reservations.length === 0) return null;

    return (
        <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    My Active Reservations ({reservations.length})
                </h3>
                <div className="space-y-3">
                    {reservations.map((reservation) => {
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
                                                onCompletePurchase(reservation, drop);
                                            }
                                        }}
                                        disabled={remaining <= 0}
                                        className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        Complete Purchase
                                    </Button>
                                    <Button
                                        onClick={() => onCancelReservation(reservation.id)}
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
    );
}
