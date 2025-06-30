import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, Lock, Mail, User, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail } from '@/utils/validation';

const demoUsers = [
  { email: 'admin@company.com', password: 'password123', role: 'admin', name: 'System Administrator' },
  { email: 'operator@company.com', password: 'password123', role: 'operator', name: 'Grid Operator' },
  { email: 'analyst@company.com', password: 'password123', role: 'analyst', name: 'Data Analyst' }
];

export default function Login() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password, formData.rememberMe);
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const quickLogin = (userType) => {
    const user = demoUsers.find(u => u.role === userType);
    if (user) {
      setFormData({
        email: user.email,
        password: user.password,
        rememberMe: false
      });
      setErrors({});
      setLoginError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Demo Credentials Banner */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Demo Credentials
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex justify-between items-center">
              <span><strong>Admin:</strong> admin@company.com / password123</span>
            </div>
            <div className="flex justify-between items-center">
              <span><strong>Operator:</strong> operator@company.com / password123</span>
            </div>
            <div className="flex justify-between items-center">
              <span><strong>Analyst:</strong> analyst@company.com / password123</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button 
              onClick={() => quickLogin('admin')} 
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <User className="w-3 h-3 mr-1" />
              Admin Login
            </Button>
            <Button 
              onClick={() => quickLogin('operator')} 
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Zap className="w-3 h-3 mr-1" />
              Operator Login
            </Button>
            <Button 
              onClick={() => quickLogin('analyst')} 
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <User className="w-3 h-3 mr-1" />
              Analyst Login
            </Button>
          </div>
        </div>

        {/* Login Card */}
        <Card variant="glass" className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Smart Grid Platform
            </CardTitle>
            <p className="text-muted-foreground">
              Secure access to your grid management dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    disabled={isLoading}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Sign In Securely</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Security Features */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  Protected by enterprise-grade security
                </p>
                <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                    <span>256-bit SSL</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                    <span>2FA Ready</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                    <span>SOC 2 Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>© 2024 Smart Grid Platform. All rights reserved.</p>
          <p className="mt-1">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
            {' • '}
            <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
            {' • '}
            <a href="#" className="hover:text-primary-600 transition-colors">Security</a>
          </p>
        </div>
      </div>
    </div>
  );
}