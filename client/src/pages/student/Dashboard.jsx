import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Spin, message } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { clearAuth, getUser } from '../../services/auth';
import ProfileView from '../../components/student/ProfileView.jsx';
import ProfileForm from '../../components/student/ProfileForm.jsx';

// ... rest of the component

const { Header, Sider, Content } = Layout;

export default function StudentDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await studentAPI.getProfile();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      if (error.message !== 'Session expired') {
        message.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    message.success('Logged out successfully');
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => setCurrentPage('profile')}>
        My Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Spin size="large" />
        </div>
      );
    }

    if (currentPage === 'profile' && !editMode) {
      return <ProfileView profile={profile} onEdit={() => setEditMode(true)} onRefresh={fetchProfile} />;
    }

    if (currentPage === 'profile' && editMode) {
      return (
        <ProfileForm
          profile={profile}
          onSuccess={() => {
            setEditMode(false);
            fetchProfile();
          }}
          onCancel={() => setEditMode(false)}
        />
      );
    }

    // Overview Dashboard
    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-blue-100">
            {profile
              ? `Your profile is ${profile.completionPercentage || 0}% complete`
              : 'Complete your profile to get started'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileTextOutlined className="text-2xl text-blue-600" />
              </div>
              <Badge count={0} showZero className="bg-blue-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Applications</h3>
            <p className="text-3xl font-bold text-gray-800">0</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserOutlined className="text-2xl text-green-600" />
              </div>
              <Badge
                count={profile?.isComplete ? 'Complete' : 'Pending'}
                style={{ backgroundColor: profile?.isComplete ? '#52c41a' : '#faad14' }}
              />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Profile Status</h3>
            <p className="text-3xl font-bold text-gray-800">
              {profile?.completionPercentage || 0}%
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DashboardOutlined className="text-2xl text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Skills Added</h3>
            <p className="text-3xl font-bold text-gray-800">
              {profile?.skills?.length || 0}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        {!profile && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Complete Your Profile</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You need to create your profile before applying for internships.</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setCurrentPage('profile');
                      setEditMode(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none transition"
                  >
                    Create Profile Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        className="shadow-lg"
        style={{ background: '#001529' }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          {!collapsed ? (
            <h1 className="text-white text-xl font-bold">Student Portal</h1>
          ) : (
            <UserOutlined className="text-white text-2xl" />
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPage]}
          onClick={({ key }) => setCurrentPage(key)}
          items={[
            {
              key: 'overview',
              icon: <DashboardOutlined />,
              label: 'Dashboard',
            },
            {
              key: 'profile',
              icon: <UserOutlined />,
              label: 'My Profile',
            },
            {
              key: 'applications',
              icon: <FileTextOutlined />,
              label: 'Applications',
            },
          ]}
        />
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <Header className="bg-white px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            {collapsed ? (
              <MenuUnfoldOutlined
                className="text-xl cursor-pointer hover:text-blue-500 transition"
                onClick={() => setCollapsed(!collapsed)}
              />
            ) : (
              <MenuFoldOutlined
                className="text-xl cursor-pointer hover:text-blue-500 transition"
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
          </div>

          <div className="flex items-center gap-6">
            <Badge count={0} showZero>
              <BellOutlined className="text-xl text-gray-600 cursor-pointer hover:text-blue-500 transition" />
            </Badge>

            <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  src={user?.profilePicture}
                  className="border-2 border-blue-500"
                />
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="m-6">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}
