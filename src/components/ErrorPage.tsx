import { ServerCrash, RefreshCw, Home, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface ErrorPageProps {
    onNavigateHome?: () => void;
    onRetry?: () => void;
    errorMessage?: string;
}

export function ErrorPage({
    onNavigateHome,
    onRetry,
    errorMessage = "We're experiencing technical difficulties. Our team has been notified and is working to fix the issue.",
}: ErrorPageProps) {
    const handleRefresh = () => {
        if (onRetry) {
            onRetry();
        } else {
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <Card className="p-8 md:p-12 text-center shadow-lg">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50"></div>
                            <div className="relative bg-red-50 rounded-full p-6">
                                <ServerCrash className="h-20 w-20 text-red-600" />
                            </div>
                        </div>
                    </div>

                    {/* Error Code */}
                    <div className="mb-4">
                        <h1 className="text-6xl md:text-8xl text-red-600 mb-2">500</h1>
                        <h2 className="text-gray-900 mb-3">Internal Server Error</h2>
                    </div>

                    {/* Error Message */}
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        {errorMessage}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleRefresh}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                        {onNavigateHome && (
                            <Button variant="outline" onClick={onNavigateHome}>
                                <Home className="h-4 w-4 mr-2" />
                                Go to Homepage
                            </Button>
                        )}
                    </div>

                    {/* Additional Help */}
                    <div className="pt-6 border-t">
                        <p className="text-sm text-muted-foreground mb-4">
                            If the problem persists, please contact our support team
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                            <Mail className="h-4 w-4" />
                            <a href="mailto:support@agriconnect.com" className="hover:underline">
                                support@agriconnect.com
                            </a>
                        </div>
                    </div>

                    {/* Error Reference */}
                    <div className="mt-6 pt-6 border-t">
                        <p className="text-xs text-muted-foreground">
                            Error Reference: ERR-{Date.now().toString(36).toUpperCase()}
                        </p>
                    </div>
                </Card>

                {/* AgriConnect Branding */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Powered by{" "}
                        <span className="text-green-600">AgriConnect</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
