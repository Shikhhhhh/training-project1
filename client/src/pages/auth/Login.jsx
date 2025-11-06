import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { authAPI } from '../../services/api.js';
import { setAuth } from '../../services/auth.js';
import { ROUTES, ROLES } from '../../utils/constants.js';
import { useTheme } from '../../components/common/ThemeProvider';
import ThemeToggle from '../../components/common/ThemeToggle';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await authAPI.login(values);
      if (data.success) {
        setAuth(data.token, data.user);
        message.success({
          content: 'Welcome back! 🎉',
          duration: 2,
          className: 'success-toast',
        });
        const { role } = data.user;
        if (role === ROLES.ADMIN) navigate(ROUTES.ADMIN_DASHBOARD);
        else if (role === ROLES.STUDENT) navigate(ROUTES.STUDENT_DASHBOARD);
        else navigate('/dashboard');
      }
    } catch (error) {
      message.error({
        content: error.message || 'Login failed',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Login Card with Glassmorphism */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-8 md:p-10 transition-all duration-300 hover:shadow-purple-500/20">
          
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/30 backdrop-blur-md rounded-2xl mb-4 shadow-lg border border-white/20">
              <UserOutlined className="text-4xl text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Internship Portal
            </h1>
            <p className="text-gray-300 dark:text-gray-400 text-sm">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Form */}
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="modern-form"
          >
            {/* Email Input */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-purple-400" />}
                placeholder="Email address"
                className="modern-input"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                }}
              />
            </Form.Item>

            {/* Password Input */}
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-purple-400" />}
                placeholder="Password"
                iconRender={(visible) => 
                  visible ? (
                    <EyeOutlined className="text-gray-400" />
                  ) : (
                    <EyeInvisibleOutlined className="text-gray-400" />
                  )
                }
                className="modern-input"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                }}
              />
            </Form.Item>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-gray-300 dark:text-gray-400">
                  Remember me
                </Checkbox>
              </Form.Item>
              <a 
                href="#" 
                className="text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="modern-button-primary"
                style={{
                  height: '52px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.4)';
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-gray-400 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-300 dark:text-gray-400 text-sm">
              Don't have an account?{' '}
              <a 
                href="#" 
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Sign up
              </a>
            </p>
          </div>

          {/* Theme Toggle */}
          <div className="mt-6 flex justify-center">
            <ThemeToggle />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          © 2025 Internship Portal. All rights reserved.
        </p>
      </div>

    </div>
  );
}
