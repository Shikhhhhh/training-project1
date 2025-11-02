// client/src/pages/admin/Settings.jsx
import { useState } from 'react';
import { 
  Layout, Menu, Card, Form, Input, Switch, Button, 
  Avatar, Dropdown, Tabs, message, Upload 
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
import { clearAuth, getUser } from '../../services/auth';

const { Header, Sider, Content } = Layout;

export default function AdminSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      // Call API to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
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
      // Call API to change password
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
      // Save system settings
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
      { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
    ],
  };

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
              name: user?.name,
              email: user?.email,
              department: user?.department,
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Avatar size={80} icon={<UserOutlined />} className="bg-purple-600" />
              <Upload>
                <Button icon={<UploadOutlined />}>Change Avatar</Button>
              </Upload>
            </div>

            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input disabled />
            </Form.Item>

            <Form.Item name="department" label="Department">
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="bg-purple-600">
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
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password />
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
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="bg-purple-600">
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
            <Form.Item name="emailNotifications" label="Email Notifications" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="jobAlerts" label="New Job Alerts" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="applicationUpdates" label="Application Status Updates" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="bg-purple-600">
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
            <Form.Item name="siteName" label="Site Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="maintenanceMode" label="Maintenance Mode" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="allowRegistration" label="Allow New Registrations" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="bg-purple-600">
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
              <Avatar icon={<UserOutlined />} className="bg-purple-600" />
              <span className="text-gray-700">{user?.name || 'Admin'}</span>
            </div>
          </Dropdown>
        </Header>

        <Content className="p-6 bg-gray-50">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Tabs items={tabItems} defaultActiveKey="profile" />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
