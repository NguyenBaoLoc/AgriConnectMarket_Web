import { useState } from "react";
import { Leaf } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { loginUser, registerUser } from "./api";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { type SignInInfo, type SignUpInfo, type LoginUser } from "./types";
import type { UserRole } from "../../types";
import { useNavigate } from "react-router-dom";
import { PageImage } from "./components/PageImage";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import { useFarmCheck } from "../../hooks/useFarmCheck";

const defaultSignInInfo: SignInInfo = {
  username: "",
  password: "",
};

const defaultSignUpInfo: SignUpInfo = {
  username: "",
  email: "",
  password: "",
  fullname: "",
  phone: "",
  isFarmer: false,
  avatar: "",
};
export function Auth() {
  const [signInInfo, setSignInInfo] = useState<SignInInfo>(defaultSignInInfo);
  const [signUpInfo, setSignUpInfo] = useState<SignUpInfo>(defaultSignUpInfo);
  const navigate = useNavigate();
  const { fetchAndSaveFarmData } = useFarmCheck();

  const onNavigateHome = (role: UserRole) => {
    if (role === ("Admin" as UserRole)) {
      navigate("/admin");
    } else if (role === ("Farmer" as UserRole)) {
      navigate("/farmer");
    } else if (
      role === ("Buyer" as UserRole) ||
      role === ("Guest" as UserRole)
    ) {
      navigate("/");
    }
  };

  const handleFormSubmit = (role: UserRole) => {
    onNavigateHome(role);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const request = signInInfo;
      const response = await loginUser(request);
      if (response.success && response.data?.token) {
        localStorage.setItem("token", response.data.token);
        const payload: any = jwtDecode(response.data.token);
        const user: LoginUser = {
          userId: response.data.userId,
          accountId: response.data.accountId,
          username:
            payload[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ],
          role: response.data.role,
        };
        localStorage.setItem("userId", user.userId);
        localStorage.setItem("accountId", user.accountId);
        localStorage.setItem("role", user.role);

        // If farmer, fetch and save farm data
        if (user.role === "Farmer") {
          await fetchAndSaveFarmData();
        }

        handleFormSubmit(user.role);
        toast.success(`Login successful: ${response.message}`);
      } else {
        toast.error(`Login failed: ${response.message}`);
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const request = signUpInfo;
      const response = await registerUser(request);
      if (response.success && response.data) {
        toast.success(
          "Registration successful! Please check your email to verify your account within 15 minutes.",
          {
            duration: 15000, // 10 seconds (default is 4000ms)
          }
        );
        setSignUpInfo(defaultSignUpInfo);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        toast.error(`Sign up failed: ${response.message}`);
      }
    } catch (error) {
      console.error("Unexpected sign up error:", error);
    }
  };
  return (
    <div className="min-h-screen flex">
      <PageImage />

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Leaf className="w-8 h-8 text-green-600" />
            <span className="text-2xl text-green-600">AgriConnect</span>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            {/* Sign In Form */}
            <SignIn
              handleSignIn={handleSignIn}
              signInInfo={signInInfo}
              setSignInInfo={setSignInInfo}
              onNavigateHome={onNavigateHome}
            />
            {/* Sign Up Form */}
            <SignUp
              handleSignUp={handleSignUp}
              signUpInfo={signUpInfo}
              setSignUpInfo={setSignUpInfo}
            />
          </Tabs>
        </div>
      </div>
    </div>
  );
}
