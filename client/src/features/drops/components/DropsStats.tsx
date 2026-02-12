import { Card, CardContent } from "@/components/ui/card";
import { Clock, ShoppingBag, Package } from "lucide-react";
import type { Drop } from "@/types/drop";

interface DropsStatsProps {
    drops: Drop[];
}

export function DropsStats({ drops }: DropsStatsProps) {
    return (
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
    );
}
