import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { resetPassword } from '../api';

export const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {}
  );
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    // Check if user has verified OTP and get email and resetToken
    const otpVerified = sessionStorage.getItem('otpVerified');
    const storedEmail = sessionStorage.getItem('resetEmail');
    const storedToken = sessionStorage.getItem('resetToken');

    if (!otpVerified || !storedEmail || !storedToken) {
      navigate('/forgot-password');
      return;
    }

    setEmail(storedEmail);
    setResetToken(storedToken);
  }, [navigate]);

  const validatePassword = (password: string) => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Include an uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Include a lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Include a number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Include a special character (!@#$%^&*)');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { password?: string; confirm?: string } = {};

    // Validate passwords
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors[0];
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // Call the reset-password API with email, resetToken, and newPassword
      const response = await resetPassword({
        email,
        resetToken,
        newPassword,
      });

      if (response.success) {
        toast.success('Password reset successfully!');

        // Clear session data
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetToken');
        sessionStorage.removeItem('otpVerified');

        // Navigate to sign in after 1.5 seconds
        navigate('/auth');
      } else {
        toast.error(
          response.message || 'Failed to reset password. Please try again.'
        );
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    sessionStorage.removeItem('resetEmail');
    sessionStorage.removeItem('resetToken');
    sessionStorage.removeItem('otpVerified');
    navigate('/auth');
  };

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
                <Lock className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-600">
              Create a strong password to secure your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-2">
              <Label
                htmlFor="new-password"
                className="text-gray-700 font-medium"
              >
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.password) {
                      const passwordErrors = validatePassword(e.target.value);
                      setErrors({
                        ...errors,
                        password:
                          passwordErrors.length > 0
                            ? passwordErrors[0]
                            : undefined,
                      });
                    }
                  }}
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Password must contain: at least 8 characters, uppercase,
                lowercase, number, and special character
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirm-password"
                className="text-gray-700 font-medium"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirm) {
                      setErrors({
                        ...errors,
                        confirm:
                          e.target.value !== newPassword
                            ? 'Passwords do not match'
                            : undefined,
                      });
                    }
                  }}
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>
              )}
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((strength) => {
                    const passwordErrors = validatePassword(newPassword);
                    const filledStrength = 5 - passwordErrors.length;
                    return (
                      <div
                        key={strength}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          strength <= filledStrength
                            ? filledStrength <= 2
                              ? 'bg-red-500'
                              : filledStrength <= 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500">
                  {validatePassword(newPassword).length === 0
                    ? '✓ Strong password'
                    : `${validatePassword(newPassword).length} requirement(s) remaining`}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium transition-all mt-6"
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                <>
                  <Lock className="mr-2 w-4 h-4" />
                  Reset Password
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>🔒 Your password is encrypted and secure</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 text-center text-xs text-gray-500 bg-white/50 backdrop-blur-sm rounded-lg p-4">
          <p>
            Having trouble resetting your password?{' '}
            <button
              type="button"
              onClick={handleBackToSignIn}
              className="text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Start over
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
