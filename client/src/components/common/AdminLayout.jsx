import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ThunderboltOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAuth, getUser, updateUser } from '../../services/auth';
import { usersAPI } from '../../services/api';
import { useTheme } from './ThemeProvider';

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getUser());
  const { isDark, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  // Refresh user data on mount to get latest avatar
  useEffect(() => {
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

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/students',
      icon: <TeamOutlined />,
      label: 'Students',
    },
    {
      key: '/admin/jobs',
      icon: <FileTextOutlined />,
      label: 'Jobs',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: 'Profile',
        icon: <UserOutlined />,
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Modern Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl border-r border-white/10 dark:border-slate-700/50"
        width={260}
        trigger={null}
      >
        <div className="p-6 text-center border-b border-white/10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/30 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/20">
              <ThunderboltOutlined className="text-white text-xl" />
            </div>
            {!collapsed && (
              <h1 className="text-white text-xl font-bold">
                Internship Portal
              </h1>
            )}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="bg-transparent border-0 mt-4"
          style={{ backgroundColor: 'transparent' }}
        />
      </Sider>

      <Layout>
        {/* Modern Header */}
        <Header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-sm px-6 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-4">
            {collapsed ? (
              <MenuUnfoldOutlined
                className="text-xl cursor-pointer text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => setCollapsed(!collapsed)}
              />
            ) : (
              <MenuFoldOutlined
                className="text-xl cursor-pointer text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <SunOutlined className="text-xl text-amber-500" />
              ) : (
                <BulbOutlined className="text-xl text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <Dropdown menu={userMenu} placement="bottomRight">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar 
                  size={40}
                  src={user?.profilePicture}
                  icon={<UserOutlined />} 
                  className="bg-purple-500/30 backdrop-blur-md shadow-md border border-purple-400/30"
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {user?.name || 'Admin'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="p-6 md:p-8 bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}



