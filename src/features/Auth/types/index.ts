import type { ApiResponse, UserRole } from "../../../types";

interface LoginUser {
  userId: string;
  accountId: string;
  username: string;
  role: UserRole;
}
interface LoginData {
  accountId: string;
  userId: string;
  role: "Admin" | "Farmer" | "Buyer";
  token: string;
}
interface SignInInfo {
  username: string;
  password: string;
}
interface SignUpInfo {
  username: string;
  email: string;
  password: string;
  fullname: string;
  phone: string;
  isFarmer: boolean;
  avatar: string;
}
type LoginResponse = ApiResponse<LoginData>;
export type { LoginUser, LoginData, LoginResponse, SignInInfo, SignUpInfo };
