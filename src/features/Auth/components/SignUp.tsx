import { ArrowRight, Lock, Mail, Phone, User } from "lucide-react";
import { Label } from "../../../components/ui/label";
import { TabsContent } from "../../../components/ui/tabs";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import type { SignUpInfo } from "../types";
import { Checkbox } from "../../../components/ui/checkbox";

interface SignUpProps {
    handleSignUp: (e: React.FormEvent) => void;
    signUpInfo: SignUpInfo;
    setSignUpInfo: (info: SignUpInfo) => void;
}
export const SignUp = ({ handleSignUp, signUpInfo, setSignUpInfo }: SignUpProps) => {
    return (
        <TabsContent value="signup">
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h2>Create an account</h2>
                    <p className="text-muted-foreground">
                        Join AgriConnect for exclusive deals and fresh deliveries
                    </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="signup-username">Username</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="signup-username"
                                type="text"
                                placeholder="Your username"
                                value={signUpInfo.username}
                                onChange={(e) => setSignUpInfo({ ...signUpInfo, username: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="signup-email"
                                type="email"
                                placeholder="you@example.com"
                                value={signUpInfo.email}
                                onChange={(e) => setSignUpInfo({ ...signUpInfo, email: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="signup-name"
                                type="text"
                                placeholder="John Doe"
                                value={signUpInfo.fullname}
                                onChange={(e) => setSignUpInfo({ ...signUpInfo, fullname: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="signup-phone">Phone</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="signup-phone"
                                type="text"
                                placeholder="Your phone number"
                                value={signUpInfo.phone}
                                onChange={(e) => setSignUpInfo({ ...signUpInfo, phone: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="signup-password"
                                type="password"
                                placeholder="Create a password"
                                value={signUpInfo.password}
                                onChange={(e) => setSignUpInfo({ ...signUpInfo, password: e.target.value })}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isFarmer"
                            checked={signUpInfo.isFarmer}
                            onCheckedChange={() => setSignUpInfo({ ...signUpInfo, isFarmer: !signUpInfo.isFarmer })}
                        />
                        <Label htmlFor="isFarmer" className="cursor-pointer">
                            I want to sign up as a farmer
                        </Label>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        By signing up, you agree to our{" "}
                        <button type="button" className="text-green-600 hover:text-green-700">
                            Terms of Service
                        </button>{" "}
                        and{" "}
                        <button type="button" className="text-green-600 hover:text-green-700">
                            Privacy Policy
                        </button>
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                        Create Account
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </form>
            </div>
        </TabsContent>

    );
}