import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DropsHeaderProps {
    lastRefresh: Date;
    isRefreshing: boolean;
    onRefresh: () => void;
}

export function DropsHeader({ lastRefresh, isRefreshing, onRefresh }: DropsHeaderProps) {
    return (
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
                            <div className={`h-3 w-3 rounded-full bg-green-300 animate-pulse`} />
                            <span className="text-sm font-medium">
                                Live Updates Active
                            </span>
                        </div>
                        <div className="text-[11px] text-purple-100/80">
                            Last sync: {lastRefresh.toLocaleTimeString()}
                        </div>
                    </div>
                    <Button
                        onClick={onRefresh}
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
    );
}
