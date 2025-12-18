import { ArrowRight, Lock, User } from "lucide-react";
import { Label } from "../../../components/ui/label";
import { TabsContent } from "../../../components/ui/tabs"
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import type { UserRole } from "../../../types";

interface SignInProps {
    handleSignIn: (e: React.FormEvent) => void;
    signInInfo: {
        username: string;
        password: string;
    };
    setSignInInfo: (info: { username: string; password: string }) => void;
    onNavigateHome: (role: UserRole) => void;
}
export const SignIn = ({ handleSignIn, signInInfo, setSignInInfo, onNavigateHome }: SignInProps) => {
    const navigate = useNavigate();
    
    return (
        <TabsContent value="signin"><div className="space-y-6">
            <div className="text-center space-y-2">
                <h2>Welcome back</h2>
                <p className="text-muted-foreground">
                    Sign in to your account to continue shopping
                </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="signin-username">Username</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            id="signin-username"
                            type="text"
                            placeholder="username"
                            value={signInInfo.username}
                            onChange={(e) => setSignInInfo({ ...signInInfo, username: e.target.value })}
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="text-sm text-green-600 hover:text-green-700 transition-colors"
                        >
                            Forgot password?
                        </button>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            id="signin-password"
                            type="password"
                            placeholder="Enter your password"
                            value={signInInfo.password}
                            onChange={(e) => setSignInInfo({ ...signInInfo, password: e.target.value })}
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Sign In
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </form>

            <div className="text-center">
                <button
                    type="button"
                    onClick={() => onNavigateHome("Guest")}
                    className="text-sm text-green-600 hover:text-green-700 transition-colors"
                >
                    Continue as guest
                </button>
            </div>
        </div>
        </TabsContent>
    )
}