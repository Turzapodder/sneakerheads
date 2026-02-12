/**
 * Reservation status enum
 */
export type ReservationStatus =
  | "active"
  | "completed"
  | "expired"
  | "cancelled";

/**
 * Reservation interface
 */
export interface Reservation {
  id: string;
  dropId: string;
  userId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  drop?: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    availableStock: number;
    brand?: string;
  };
}

/**
 * Reservation API response
 */
export interface ReservationResponse {
  success: boolean;
  message: string;
  data?: {
    reservation: Reservation;
    drop?: {
      id: string;
      availableStock: number;
      reservedStock: number;
      soldStock: number;
    };
  };
}

/**
 * User reservations API response
 */
export interface UserReservationsResponse {
  success: boolean;
  data: Reservation[];
  count: number;
}
