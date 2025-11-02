// client/src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Row, Col, Card, Spin } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  CheckCircleOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { clearAuth, getUser } from '../../services/auth';
import StatsCard from '../../components/admin/StatsCard';

const { Header, Sider, Content } = Layout;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
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
    <Layout className="min-h-screen">
      {/* Sidebar */}
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
        {/* Header */}
        <Header className="bg-white shadow-md px-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar icon={<UserOutlined />} className="bg-purple-600" />
              <span className="text-gray-700">{user?.name || 'Admin'}</span>
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content className="p-6 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <Row gutter={[16, 16]} className="mb-6">
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
                    value="12"
                    icon={<FileTextOutlined />}
                    color="orange"
                  />
                </Col>
              </Row>

              {/* Charts */}
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="Students by Graduation Year" className="rounded-xl shadow-lg">
                    <div className="space-y-2">
                      {stats?.studentsByYear?.map((item) => (
                        <div key={item._id} className="flex justify-between items-center">
                          <span className="text-gray-700">Year {item._id}</span>
                          <span className="font-semibold text-purple-600">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Top Branches" className="rounded-xl shadow-lg">
                    <div className="space-y-2">
                      {stats?.studentsByBranch?.slice(0, 5).map((item) => (
                        <div key={item._id} className="flex justify-between items-center">
                          <span className="text-gray-700">{item._id}</span>
                          <span className="font-semibold text-blue-600">{item.count}</span>
                        </div>
                      ))}
                    </div>
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
