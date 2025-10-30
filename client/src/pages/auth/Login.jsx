import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { authAPI } from '../../services/api.js';
import { setAuth } from '../../services/auth.js';
import { ROUTES, ROLES } from '../../utils/constants.js';
import leftImage from '../../assets/card-payment.png';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await authAPI.login(values);
      if (data.success) {
        setAuth(data.token, data.user);
        message.success('Welcome back!');
        const { role } = data.user;
        if (role === ROLES.ADMIN) navigate(ROUTES.ADMIN_DASHBOARD);
        else if (role === ROLES.STUDENT) navigate(ROUTES.STUDENT_DASHBOARD);
        else navigate('/dashboard');
      }
    } catch (error) {
      message.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT - PNG Image */}
        <div className="hidden lg:flex justify-center items-center">
          <img 
            src={leftImage} 
            alt="Internship Portal" 
            className="w-full h-auto max-w-lg object-contain"
          />
        </div>

        {/* RIGHT - Instagram-Style Form */}
        <div className="w-full max-w-sm mx-auto">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-white text-5xl mb-2" style={{ fontFamily: 'cursive', fontWeight: 'normal' }}>
              Portal-Login
            </h1>
          </div>

          {/* Form Container (Black Background) */}
          <div className="space-y-3">
            
            <Form onFinish={onFinish} layout="vertical">
              {/* Email Input */}
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '' },
                  { type: 'email', message: '' }
                ]}
              >
                <Input
                  placeholder="Phone number, username, or email"
                  style={{
                    backgroundColor: '#121212',
                    border: '1px solid #262626',
                    color: '#ffffff',
                    padding: '12px',
                    fontSize: '14px',
                    borderRadius: '4px'
                  }}
                  className="text-white placeholder-gray-500"
                />
              </Form.Item>

              {/* Password Input */}
              <Form.Item
                name="password"
                rules={[{ required: true, message: '' }]}
              >
                <Input.Password
                  placeholder="Password"
                  iconRender={(visible) => (
                    <span style={{ color: '#ffffff', fontSize: '12px', cursor: 'pointer' }}>
                      {visible ? 'Hide' : 'Show'}
                    </span>
                  )}
                  style={{
                    backgroundColor: '#121212',
                    border: '1px solid #262626',
                    color: '#ffffff',
                    padding: '12px',
                    fontSize: '14px',
                    borderRadius: '4px'
                  }}
                  className="text-white placeholder-gray-500"
                />
              </Form.Item>

              {/* Login Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    backgroundColor: '#A376FF',
                    border: 'none',
                    borderRadius: '8px',
                    height: '44px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff'
                  }}
                  className="hover:bg-blue-600"
                >
                  Log in
                </Button>
              </Form.Item>
            </Form>

            {/* OR Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 h-px bg-gray-700"></div>
              <span className="px-4 text-gray-500 text-sm font-semibold">OR</span>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            {/* Facebook Login */}
           <button 
            type="button"
             onClick={() => console.log('Facebook login clicked')}
              className="w-full flex items-center justify-center gap-2 text-blue-500 font-semibold text-sm py-2.5 hover:text-blue-400 bg-black rounded-md transition-colors duration-200"
               style={{ 
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Log in with Facebook
            </button>

            {/* Forgot Password */}
            <div className="text-center mt-6">
              <a href="#" className="text-gray-400 text-xs hover:text-gray-300">
                Forgot password?
              </a>
            </div>
          </div>

          {/* Sign Up Section */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <a href="#" className="text-blue-500 font-semibold hover:text-blue-400">
                Sign up
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
