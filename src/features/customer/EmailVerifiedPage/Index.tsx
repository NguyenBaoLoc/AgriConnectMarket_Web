import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, Home } from "lucide-react";

export function EmailVerifiedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get("error");

  useEffect(() => {
    // Auto redirect to home after 5 seconds if no error
    if (!error) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {!error ? (
          // Success State
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Email Verified Successfully
            </h1>
            <p className="text-gray-600 mb-6">
              Your email has been verified. You can now start shopping on
              AgriConnect Market.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Redirecting to home page in 5 seconds...
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </button>
          </div>
        ) : (
          // Error State
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-20 h-20 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Email Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't verify your email address.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-700 font-semibold text-sm">
                Error Details:
              </p>
              <p className="text-red-600 text-sm mt-2 break-words">
                {decodeURIComponent(error)}
              </p>
            </div>
            <button
              onClick={() => navigate("/auth")}
              className="w-full border border-red-200 bg-red-500 hover:bg-blue-600 text-black font-semibold py-3 px-4 rounded-lg"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
