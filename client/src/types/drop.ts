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
  reservedStock?: number;
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
  isReserved?: boolean; 
  purchases?: Array<{
    id: string;
    purchasedAt: string;
    user: {
      clerkId: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
  }>;
}

export interface StockUpdate {
  dropId: string;
  totalStock: number;
  availableStock: number;
  soldStock: number;
  reservedStock?: number;
  timestamp: string;
}
