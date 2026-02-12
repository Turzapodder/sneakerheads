import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Package } from "lucide-react";
import type { Drop } from "@/types/drop";
import type { Reservation } from "@/types/reservation";

interface DropsTableProps {
    drops: Drop[];
    myReservations: Reservation[];
    reservingDropId: string | null;
    onReserve: (sneaker: Drop) => void;
}

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

export function DropsTable({ drops, myReservations, reservingDropId, onReserve }: DropsTableProps) {
    return (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-linear-to-r from-slate-50 to-slate-100">
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
                            const isReservingStart = reservingDropId === sneaker.id;
                            const isAnyReserving = !!reservingDropId;

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
                                        <div className="flex items-center -space-x-2">
                                            {sneaker.purchases && sneaker.purchases.length > 0 ? (
                                                Array.from(new Map(sneaker.purchases.map(p => [p.user.clerkId, p])).values())
                                                    .slice(0, 3)
                                                    .map((purchase) => (
                                                        <Avatar
                                                            key={purchase.id}
                                                            className="h-8 w-8 border-2 border-white ring-offset-2 hover:z-10 transition-transform hover:scale-110 cursor-help"
                                                            title={getUsername(purchase.user)}
                                                        >
                                                            <AvatarImage src={purchase.user.profileImageUrl} alt={getUsername(purchase.user)} />
                                                            <AvatarFallback className="bg-purple-100 text-purple-600 text-[10px] font-bold">
                                                                {getUsername(purchase.user).substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic pl-2">
                                                    No purchases yet
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            onClick={() => onReserve(sneaker)}
                                            disabled={sneaker.availableStock === 0 || isAnyReserving}
                                            className={`${hasReservation ? 'bg-purple-500 hover:bg-purple-600' : 'bg-[#90EE90] hover:bg-[#7CDA7C]'} text-slate-900 font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                            size="sm"
                                        >
                                            {isReservingStart ? (
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
    );
}
