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
  TrophyOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { clearAuth, getUser } from '../../services/auth';
import ProfileView from '../../components/student/ProfileView.jsx';
import ProfileForm from '../../components/student/ProfileForm.jsx';
import StudentJobs from './Jobs.jsx';
import { useTheme } from '../../components/common/ThemeProvider';

const { Header, Sider, Content } = Layout;

export default function StudentDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const user = getUser();
  const { isDark, toggleTheme } = useTheme();

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

    if (currentPage === 'jobs') {
      return <StudentJobs />;
    }

    // Modern Overview Dashboard
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-3xl p-8 md:p-10 text-white shadow-2xl">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <RocketOutlined className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  Welcome back, {user?.name || 'Student'}! 👋
                </h1>
                <p className="text-purple-100 text-lg">
                  {profile
                    ? `Your profile is ${profile.completionPercentage || 0}% complete`
                    : 'Complete your profile to unlock opportunities'}
                </p>
              </div>
            </div>
            
            {profile && (
              <div className="flex items-center gap-4 mt-6">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white font-semibold">
                  {profile.skills?.length || 0} Skills
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white font-semibold">
                  {profile.cgpa ? `${profile.cgpa} CGPA` : 'No CGPA'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Applications Card */}
          <div className="group relative bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FileTextOutlined className="text-2xl text-white" />
              </div>
              <Badge count={0} showZero className="bg-blue-500" />
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Applications</h3>
            <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">0</p>
            <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Profile Status Card */}
          <div className="group relative bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <TrophyOutlined className="text-2xl text-white" />
              </div>
              <Badge
                count={profile?.isComplete ? 'Complete' : 'Pending'}
                style={{ 
                  backgroundColor: profile?.isComplete ? '#10B981' : '#F59E0B',
                  fontSize: '10px',
                  padding: '0 8px',
                  height: '20px',
                  lineHeight: '20px',
                }}
              />
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Profile Status</h3>
            <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">
              {profile?.completionPercentage || 0}%
            </p>
            <div className="mt-4">
              <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${profile?.completionPercentage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Skills Card */}
          <div className="group relative bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <DashboardOutlined className="text-2xl text-white" />
              </div>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Skills Added</h3>
            <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">
              {profile?.skills?.length || 0}
            </p>
            <div className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        {/* Quick Actions - Profile Completion Alert */}
        {!profile && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-400 dark:border-amber-500 p-6 rounded-2xl shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-400 dark:bg-amber-500 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-amber-800 dark:text-amber-200 mb-4">
                  Create your profile to start applying for internships and job opportunities.
                </p>
                <button
                  onClick={() => {
                    setCurrentPage('profile');
                    setEditMode(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Create Profile Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Modern Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        className="shadow-2xl"
        style={{ 
          background: 'linear-gradient(180deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)',
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          {!collapsed ? (
            <h1 className="text-white text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Student Portal
            </h1>
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
              key: 'jobs',
              icon: <FileTextOutlined />,
              label: 'Jobs',
            },
            {
              key: 'applications',
              icon: <FileTextOutlined />,
              label: 'Applications',
            },
          ]}
          style={{ backgroundColor: 'transparent' }}
        />
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Modern Header */}
        <Header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-6 flex items-center justify-between shadow-sm sticky top-0 z-50 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center">
            {collapsed ? (
              <MenuUnfoldOutlined
                className="text-xl cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => setCollapsed(!collapsed)}
              />
            ) : (
              <MenuFoldOutlined
                className="text-xl cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
          </div>

          <div className="flex items-center gap-6">
            <Badge count={0} showZero>
              <BellOutlined className="text-xl text-gray-600 dark:text-gray-400 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors" />
            </Badge>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  src={user?.profilePicture}
                  className="border-2 border-purple-500 shadow-md"
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
