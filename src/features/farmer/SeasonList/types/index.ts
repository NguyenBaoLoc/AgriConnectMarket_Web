import type { ApiResponse } from "../../../../types";

type Status = "Pending" | "Upcoming" | "Active" | "Completed";
interface Season {
  seasonName: string;
  seasonDesc: string;
  status: Status;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt?: string;
  farmId: string;
  productId?: string;
  id: string;
}
type SeasonListResponse = ApiResponse<Season[]>;
type FarmResponse = ApiResponse<any>;

export type { Season, SeasonListResponse, Status, FarmResponse };
