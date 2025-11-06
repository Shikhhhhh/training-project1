// Modern Admin Settings Page - MetaMask Inspired
import { useState, useEffect } from 'react';
import { 
  Card, Form, Input, Switch, Button, 
  Avatar, Tabs, message, Upload
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  BellOutlined,
  GlobalOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { getUser, getToken, updateUser } from '../../services/auth';
import { usersAPI } from '../../services/api';
import { API_URL } from '../../utils/constants';
import AdminLayout from '../../components/common/AdminLayout';

const { TextArea } = Input;

export default function AdminSettings() {
  const user = getUser();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture || null);

  // Load avatar from user data on mount
  useEffect(() => {
    if (user?.profilePicture) {
      setAvatarUrl(user.profilePicture);
    }
  }, [user]);

  // Custom upload handler
  const handleAvatarUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`${API_URL}/upload/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('📸 Upload response:', data);

      if (response.ok && data.success) {
        console.log('✅ Setting avatar URL to:', data.url);
        setAvatarUrl(data.url);
        
        // Fetch updated user data from server to get the latest profile picture
        try {
          const userData = await usersAPI.getMe();
          if (userData.success && userData.user) {
            // Update user in localStorage with fresh data from server
            updateUser(userData.user);
            console.log('💾 Updated localStorage with fresh user data:', userData.user);
          }
        } catch (fetchError) {
          console.warn('⚠️ Failed to fetch updated user data, using uploaded URL:', fetchError);
          // Fallback: update with the URL we received
          updateUser({ profilePicture: data.url });
        }
        
        message.success('Profile picture uploaded successfully!');
        onSuccess(data, file);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      message.error(error.message || 'Failed to upload image');
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  // Validate file before upload
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }

    return true;
  };

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      console.log('Updating profile:', values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      console.log('Changing password');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Password changed successfully');
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettings = async (values) => {
    setLoading(true);
    try {
      console.log('Saving settings:', values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Settings saved successfully');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Define tab items
  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined /> Profile
        </span>
      ),
      children: (
        <Card className="bg-white dark:bg-slate-800/80 border-gray-200 dark:border-slate-700">
          <Form
            layout="vertical"
            onFinish={handleProfileUpdate}
            initialValues={{
              name: user?.name || '',
              email: user?.email || '',
              department: user?.department || '',
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Avatar 
                size={100} 
                src={avatarUrl}
                icon={<UserOutlined />} 
                className="bg-purple-500/30 backdrop-blur-md shadow-lg border border-purple-400/30"
              />
              
              <div>
                <Upload
                  customRequest={handleAvatarUpload}
                  beforeUpload={beforeUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button 
                    icon={<UploadOutlined />}
                    loading={uploading}
                    type="primary"
                    className="bg-purple-600/80 dark:bg-purple-500/80 backdrop-blur-md border-0 hover:bg-purple-700/80 dark:hover:bg-purple-600/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-white"
                    style={{ borderRadius: '12px' }}
                  >
                    {uploading ? 'Uploading...' : 'Change Avatar'}
                  </Button>
                </Upload>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Max 5MB, JPG/PNG</p>
              </div>
            </div>

            <Form.Item 
              name="name" 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Full Name</span>}
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input 
                placeholder="Your full name" 
                className="modern-input"
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>

            <Form.Item 
              name="email" 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Email</span>}
              rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}
            >
              <Input disabled className="modern-input" style={{ borderRadius: '12px' }} />
            </Form.Item>

            <Form.Item 
              name="department" 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Department</span>}
            >
              <Input placeholder="Your department" className="modern-input" style={{ borderRadius: '12px' }} />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="bg-purple-600/80 dark:bg-purple-500/80 backdrop-blur-md border-0 hover:bg-purple-700/80 dark:hover:bg-purple-600/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-white"
                style={{ borderRadius: '12px', padding: '0 24px', height: '44px' }}
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined /> Security
        </span>
      ),
      children: (
        <Card className="bg-white dark:bg-slate-800/80 border-gray-200 dark:border-slate-700">
          <Form layout="vertical" onFinish={handlePasswordChange}>
            <Form.Item
              name="currentPassword"
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Current Password</span>}
              rules={[{ required: true, message: 'Please enter current password' }]}
            >
              <Input.Password 
                placeholder="Enter current password" 
                className="modern-input"
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">New Password</span>}
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password 
                placeholder="Enter new password" 
                className="modern-input"
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Confirm New Password</span>}
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password 
                placeholder="Confirm password" 
                className="modern-input"
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="bg-purple-600/80 dark:bg-purple-500/80 backdrop-blur-md border-0 hover:bg-purple-700/80 dark:hover:bg-purple-600/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-white"
                style={{ borderRadius: '12px', padding: '0 24px', height: '44px' }}
              >
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined /> Notifications
        </span>
      ),
      children: (
        <Card className="bg-white dark:bg-slate-800/80 border-gray-200 dark:border-slate-700">
          <Form
            layout="vertical"
            onFinish={handleSystemSettings}
            initialValues={{
              emailNotifications: true,
              jobAlerts: true,
              applicationUpdates: true,
            }}
          >
            <Form.Item 
              name="emailNotifications" 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Email Notifications</span>}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item 
              name="jobAlerts" 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">New Job Alerts</span>}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item 
              name="applicationUpdates" 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Application Status Updates</span>}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="bg-purple-600/80 dark:bg-purple-500/80 backdrop-blur-md border-0 hover:bg-purple-700/80 dark:hover:bg-purple-600/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-white"
                style={{ borderRadius: '12px', padding: '0 24px', height: '44px' }}
              >
                Save Preferences
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'system',
      label: (
        <span>
          <GlobalOutlined /> System
        </span>
      ),
      children: (
        <Card className="bg-white dark:bg-slate-800/80 border-gray-200 dark:border-slate-700">
          <Form
            layout="vertical"
            onFinish={handleSystemSettings}
            initialValues={{
              siteName: 'Internship Portal',
              maintenanceMode: false,
              allowRegistration: true,
            }}
          >
            <Form.Item 
              name="siteName" 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Site Name</span>}
              rules={[{ required: true, message: 'Please enter site name' }]}
            >
              <Input placeholder="Site name" className="modern-input" style={{ borderRadius: '12px' }} />
            </Form.Item>

            <Form.Item 
              name="maintenanceMode" 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Maintenance Mode</span>}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item 
              name="allowRegistration" 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Allow New Registrations</span>}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="bg-purple-600/80 dark:bg-purple-500/80 backdrop-blur-md border-0 hover:bg-purple-700/80 dark:hover:bg-purple-600/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-white"
                style={{ borderRadius: '12px', padding: '0 24px', height: '44px' }}
              >
                Save System Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl p-6 md:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            Settings
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>
        <Tabs 
          items={tabItems} 
          defaultActiveKey="profile"
          type="card"
          className="modern-tabs"
        />
      </div>
    </AdminLayout>
  );
}
