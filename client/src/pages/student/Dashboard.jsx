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
import { studentAPI, usersAPI } from '../../services/api';
import { clearAuth, getUser, updateUser } from '../../services/auth';
import { useTheme } from '../../components/common/ThemeProvider';
import ThemeToggle from '../../components/common/ThemeToggle';
import ProfileView from '../../components/student/ProfileView.jsx';
import ProfileForm from '../../components/student/ProfileForm.jsx';
import StudentJobs from './Jobs.jsx';
import { List, Tag } from 'antd';
import dayjs from 'dayjs';


// ... rest of the component

const { Header, Sider, Content } = Layout;

export default function StudentDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchProfile();
    // Refresh user data on mount to get latest avatar
    const refreshUserData = async () => {
      try {
        const userData = await usersAPI.getMe();
        if (userData.success && userData.user) {
          updateUser(userData.user);
          setUser(userData.user);
        }
      } catch (error) {
        console.warn('Failed to refresh user data:', error);
      }
    };
    refreshUserData();
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
      <Menu.Item key= "student-jobs" icon= {<FileTextOutlined />}>
      Jobs
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

    if (currentPage === 'applications') {
      return <StudentApplications />;
    }

    if (currentPage === 'jobs') {
      return <StudentJobs />;
    }

    // Overview Dashboard
    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-purple-600/20 dark:bg-purple-500/20 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-purple-300/30 dark:border-purple-400/30">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-gray-700 dark:text-gray-200">
            {profile
              ? `Your profile is ${profile.completionPercentage || 0}% complete`
              : 'Complete your profile to get started'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800/80 rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileTextOutlined className="text-2xl text-blue-600" />
              </div>
              <Badge count={0} showZero className="bg-blue-500" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Applications</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">0</p>
          </div>

          <div className="bg-white dark:bg-slate-800/80 rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserOutlined className="text-2xl text-green-600" />
              </div>
              <Badge
                count={profile?.isComplete ? 'Complete' : 'Pending'}
                style={{ backgroundColor: profile?.isComplete ? '#52c41a' : '#faad14' }}
              />
            </div>
            <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Profile Status</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {profile?.completionPercentage || 0}%
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/80 rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DashboardOutlined className="text-2xl text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Skills Added</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {profile?.skills?.length || 0}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        {!profile && (
          <div className="bg-yellow-50 dark:bg-slate-800/60 border-l-4 border-yellow-400 dark:border-slate-700 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-gray-200">Complete Your Profile</h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-gray-300">
                  <p>You need to create your profile before applying for internships.</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setCurrentPage('profile');
                      setEditMode(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 dark:text-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 focus:outline-none transition"
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
    <Layout className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        className="shadow-2xl bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-white/10 dark:border-slate-700/50"
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10">
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
        />
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <Header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-6 flex items-center justify-between shadow-sm border-b border-gray-200/50 dark:border-slate-700/50">
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
              <BellOutlined className="text-xl text-gray-600 dark:text-gray-400 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors" />
            </Badge>

            <ThemeToggle />

            <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <Avatar
                  size={40}
                  src={user?.profilePicture}
                  icon={<UserOutlined />}
                  className="bg-purple-500/30 backdrop-blur-md border-2 border-purple-400/50 shadow-md"
                />
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="p-6 md:p-8 bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

function StudentApplications() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await studentAPI.getMyApplications();
        if (data && data.success) {
          setApplications(Array.isArray(data.applications) ? data.applications : []);
        } else if (Array.isArray(data)) {
          // Fallback if API returns an array directly
          setApplications(data);
        } else {
          setApplications([]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-8 text-center border border-gray-200 dark:border-slate-700">
        <p className="text-gray-600 dark:text-gray-300">You haven't applied to any jobs yet.</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">My Applications</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Total: {applications.length}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app, idx) => {
          const job = app.jobId || app.job || {};
          const statusText = (app.status || app.stage || 'pending').toUpperCase();
          return (
            <div key={app._id || `${job._id || idx}`}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-1 bg-purple-500/50 dark:bg-purple-400/50 w-full"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{job.title || 'Job'}</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium truncate">{job.companyName || 'Company'}</p>
                  </div>
                  <Tag color={statusText === 'PENDING' || statusText === 'APPLIED' ? 'orange' : 'green'} className="rounded-full">
                    {statusText}
                  </Tag>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Applied on {dayjs(app.appliedAt || app.createdAt).format('MMM DD, YYYY')}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {job.location && <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-md">{job.location}</span>}
                  {job.jobType && <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-md">{job.jobType}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

