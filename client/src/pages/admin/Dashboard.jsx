// Modern Admin Dashboard - MetaMask Inspired
import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Row, Col, Card, Spin, Skeleton } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  CheckCircleOutlined,
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { clearAuth, getUser } from '../../services/auth';
import StatsCard from '../../components/admin/StatsCard';
import { useTheme } from '../../components/common/ThemeProvider';

const { Header, Sider, Content } = Layout;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const { isDark, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminAPI.getStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
        className="bg-gradient-to-b from-purple-700 via-purple-800 to-indigo-900 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 shadow-2xl"
        width={260}
        trigger={null}
      >
        <div className="p-6 text-center border-b border-white/10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
              <ThunderboltOutlined className="text-white text-xl" />
            </div>
            {!collapsed && (
              <h1 className="text-white text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
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
          style={{
            backgroundColor: 'transparent',
          }}
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
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Dashboard Overview
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <Dropdown menu={userMenu} placement="bottomRight">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar 
                  icon={<UserOutlined />} 
                  className="bg-gradient-to-br from-purple-500 to-indigo-500 shadow-md"
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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="rounded-2xl">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Welcome Section */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Welcome back, {user?.name || 'Admin'}! 👋
                  </h1>
                  <p className="text-purple-100 text-lg">
                    Here's what's happening with your internship portal today
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <Row gutter={[24, 24]} className="mb-8">
                <Col xs={24} sm={12} lg={6}>
                  <StatsCard
                    title="Total Students"
                    value={stats?.totalStudents || 0}
                    icon={<TeamOutlined />}
                    color="blue"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatsCard
                    title="Verified Students"
                    value={stats?.verifiedStudents || 0}
                    icon={<CheckCircleOutlined />}
                    color="green"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatsCard
                    title="Average CGPA"
                    value={stats?.avgCgpa || '0.00'}
                    icon={<BookOutlined />}
                    color="purple"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatsCard
                    title="Active Jobs"
                    value={stats?.activeJobs || 0}
                    icon={<FileTextOutlined />}
                    color="orange"
                  />
                </Col>
              </Row>

              {/* Charts Section */}
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card 
                    className="rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800/80 backdrop-blur-sm"
                    title={
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          Students by Graduation Year
                        </span>
                      </div>
                    }
                  >
                    {stats?.studentsByYear && stats.studentsByYear.length > 0 ? (
                      <div className="space-y-3">
                        {stats.studentsByYear.map((item, index) => (
                          <div 
                            key={item._id} 
                            className="flex justify-between items-center p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-colors group"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              Year {item._id}
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                                  style={{ width: `${(item.count / (stats.studentsByYear[0]?.count || 1)) * 100}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-purple-600 dark:text-purple-400 min-w-[40px] text-right">
                                {item.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <div className="text-4xl mb-2">📊</div>
                        <p>No data available</p>
                      </div>
                    )}
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card 
                    className="rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800/80 backdrop-blur-sm"
                    title={
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"></div>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          Top Branches
                        </span>
                      </div>
                    }
                  >
                    {stats?.studentsByBranch && stats.studentsByBranch.length > 0 ? (
                      <div className="space-y-3">
                        {stats.studentsByBranch.slice(0, 5).map((item, index) => (
                          <div 
                            key={item._id} 
                            className="flex justify-between items-center p-3 rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-700/50 transition-colors group"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {item._id || 'Unknown'}
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-500"
                                  style={{ width: `${(item.count / (stats.studentsByBranch[0]?.count || 1)) * 100}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-cyan-600 dark:text-cyan-400 min-w-[40px] text-right">
                                {item.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <div className="text-4xl mb-2">📈</div>
                        <p>No data available</p>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
