import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Card, Form, Input, Switch, Button, 
  Avatar, Dropdown, Tabs, message, Upload, Spin
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
  BellOutlined,
  GlobalOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAuth, getUser, getToken } from '../../services/auth';
import { API_URL } from '../../utils/constants';

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;

export default function AdminSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

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
    console.log('📸 Upload response:', data); // ✅ Debug log

    if (response.ok && data.success) {
      console.log('✅ Setting avatar URL to:', data.url); // ✅ Debug log
      setAvatarUrl(data.url);
      
      // Update user in localStorage
      const updatedUser = { ...user, profilePicture: data.url };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('💾 Updated localStorage:', updatedUser); // ✅ Debug log
      
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

  const menuItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/students', icon: <TeamOutlined />, label: 'Students' },
    { key: '/admin/jobs', icon: <FileTextOutlined />, label: 'Jobs' },
    { key: '/admin/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const userMenu = {
    items: [
      { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
      { 
        key: 'logout', 
        label: 'Logout', 
        icon: <LogoutOutlined />, 
        danger: true, 
        onClick: handleLogout 
      },
    ],
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
        <Card>
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
                className="bg-purple-600" 
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
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {uploading ? 'Uploading...' : 'Change Avatar'}
                  </Button>
                </Upload>
                <p className="text-xs text-gray-500 mt-2">Max 5MB, JPG/PNG</p>
              </div>
            </div>

            <Form.Item 
              name="name" 
              label="Full Name" 
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input placeholder="Your full name" />
            </Form.Item>

            <Form.Item 
              name="email" 
              label="Email" 
              rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item name="department" label="Department">
              <Input placeholder="Your department" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="bg-purple-600 hover:bg-purple-700">
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
        <Card>
          <Form layout="vertical" onFinish={handlePasswordChange}>
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter current password' }]}
            >
              <Input.Password placeholder="Enter current password" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
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
              <Input.Password placeholder="Confirm password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="bg-purple-600 hover:bg-purple-700">
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
        <Card>
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
              label="Email Notifications" 
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item 
              name="jobAlerts" 
              label="New Job Alerts" 
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item 
              name="applicationUpdates" 
              label="Application Status Updates" 
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="bg-purple-600 hover:bg-purple-700">
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
        <Card>
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
              label="Site Name" 
              rules={[{ required: true, message: 'Please enter site name' }]}
            >
              <Input placeholder="Site name" />
            </Form.Item>

            <Form.Item 
              name="maintenanceMode" 
              label="Maintenance Mode" 
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item 
              name="allowRegistration" 
              label="Allow New Registrations" 
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="bg-purple-600 hover:bg-purple-700">
                Save System Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="bg-gradient-to-b from-purple-700 to-purple-900"
        width={250}
      >
        <div className="p-6 text-center">
          <h1 className="text-white text-2xl font-bold">
            {collapsed ? 'IP' : 'Internship Portal'}
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="bg-transparent border-0"
        />
      </Sider>

      <Layout>
        <Header className="bg-white shadow-md px-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar 
                size={40}
                src={avatarUrl}
                icon={<UserOutlined />} 
                className="bg-purple-600" 
              />
              <span className="text-gray-700">{user?.name || 'Admin'}</span>
            </div>
          </Dropdown>
        </Header>

        <Content className="p-6 bg-gray-50">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Tabs 
              items={tabItems} 
              defaultActiveKey="profile"
              type="card"
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
