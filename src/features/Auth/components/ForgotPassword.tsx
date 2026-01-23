import { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle, Lock } from 'lucide-react';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOtp } from '../api';
import { toast } from 'sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '../../../components/ui/input-otp';

type ForgotPasswordStep = 'email' | 'otp' | 'success';

export const ForgotPassword = () => {
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const navigate = useNavigate();

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await forgotPassword({ email });

      // When status is 200, email was sent successfully - navigate to OTP screen
      if (response.statusCode === 200) {
        setStep('otp');
        toast.success('OTP sent! Please check your email.');
      } else {
        toast.error(
          response.message || 'Failed to send OTP. Please try again.'
        );
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpError('');
    setIsLoading(true);

    try {
      const response = await verifyOtp({ email, otp });

      if (response.success) {
        setStep('success');
        toast.success('OTP verified successfully!');

        // Store email and resetToken in sessionStorage for password reset page
        sessionStorage.setItem('resetEmail', email);
        sessionStorage.setItem('resetToken', response.resetToken || '');
        sessionStorage.setItem('otpVerified', 'true');

        // Navigate to reset password page after 1.5 seconds
        setTimeout(() => {
          navigate('/reset-password');
        }, 1500);
      } else {
        setOtpError(response.message || 'Invalid OTP. Please try again.');
        toast.error(response.message || 'OTP verification failed.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate('/auth');
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setOtpError('');
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await forgotPassword({ email });
      // When status is 200, OTP was resent successfully
      if (response.statusCode === 200) {
        setOtp('');
        setOtpError('');
        toast.success('OTP resent! Please check your email.');
      } else {
        toast.error(
          response.message || 'Failed to resend OTP. Please try again.'
        );
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-green-50 to-green-100">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
            {/* Success Icon Animation */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                OTP Verified!
              </h2>
              <p className="text-gray-600">
                Your identity has been confirmed. You'll be redirected to reset
                your password.
              </p>
            </div>

            {/* Loading indicator */}
            <div className="flex justify-center gap-1">
              <div
                className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                style={{ animationDelay: '0s' }}
              ></div>
              <div
                className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OTP verification screen
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-green-50 to-green-100">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Header */}
            <button
              onClick={handleBackToEmail}
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Title Section */}
            <div className="text-center space-y-2 pt-2">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Enter OTP</h2>
              <p className="text-gray-600 text-sm">
                We've sent a 6-digit code to{' '}
                <span className="font-semibold text-green-600">{email}</span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitOtp} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">
                  One-Time Password
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className="w-12 h-12 text-lg font-bold border-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                      />
                      <InputOTPSlot
                        index={1}
                        className="w-12 h-12 text-lg font-bold border-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                      />
                      <InputOTPSlot
                        index={2}
                        className="w-12 h-12 text-lg font-bold border-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                      />
                      <InputOTPSlot
                        index={3}
                        className="w-12 h-12 text-lg font-bold border-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                      />
                      <InputOTPSlot
                        index={4}
                        className="w-12 h-12 text-lg font-bold border-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                      />
                      <InputOTPSlot
                        index={5}
                        className="w-12 h-12 text-lg font-bold border-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Enter the code sent to your email. Code expires in 10 minutes.
                </p>
              </div>

              {/* Error Message */}
              {otpError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{otpError}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium transition-all"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 w-4 h-4" />
                    Verify OTP
                  </>
                )}
              </Button>
            </form>

            {/* Resend OTP */}
            <div className="pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-green-600 hover:text-green-700 font-medium transition-colors disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </p>
            </div>

            {/* Back to Sign In Link */}
            <div className="text-center text-xs text-gray-500">
              <button
                type="button"
                onClick={handleBackToSignIn}
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Email entry screen
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-green-50 to-green-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <button
            onClick={handleBackToSignIn}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Sign In</span>
          </button>

          {/* Title Section */}
          <div className="text-center space-y-2 pt-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Forgot Password?
            </h2>
            <p className="text-gray-600">
              No worries! Enter your email address and we'll send you an OTP to
              reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitEmail} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We'll send a verification code to this email address
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 w-4 h-4" />
                  Send OTP
                </>
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={handleBackToSignIn}
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-gray-500 bg-white/50 backdrop-blur-sm rounded-lg p-4">
          <p>
            🔒 For your security, the OTP will expire in 10 minutes. If you
            don't receive an email, please check your spam folder.
          </p>
        </div>
      </div>
    </div>
  );
};
