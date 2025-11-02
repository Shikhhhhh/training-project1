// client/src/pages/admin/Students.jsx
import { useState, useEffect } from 'react';
import { Layout, Menu, Table, Input, Button, Tag, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { clearAuth, getUser } from '../../services/auth';

const { Header, Sider, Content } = Layout;
const { Search } = Input;

export default function AdminStudents() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [collapsed, setCollapsed] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const data = await adminAPI.getStudents({ page, limit: 10, search });
      if (data.success) {
        setStudents(data.profiles);
        setPagination({
          current: data.currentPage,
          pageSize: 10,
          total: data.total,
        });
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchStudents(newPagination.current);
  };

  const handleSearch = (value) => {
    fetchStudents(1, value);
  };

  const columns = [
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.user?.profilePicture} icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.user?.name}</div>
            <div className="text-xs text-gray-500">{record.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Program',
      dataIndex: 'program',
      key: 'program',
    },
    {
      title: 'CGPA',
      dataIndex: 'cgpa',
      key: 'cgpa',
      sorter: (a, b) => a.cgpa - b.cgpa,
    },
    {
      title: 'Graduation Year',
      dataIndex: 'graduationYear',
      key: 'graduationYear',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isComplete ? 'green' : 'orange'}>
          {record.completionPercentage}% Complete
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button size="small" type="link">
          View Details
        </Button>
      ),
    },
  ];

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
          <h1 className="text-white text-2xl font-bold">{collapsed ? 'IP' : 'Internship Portal'}</h1>
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
          <h2 className="text-xl font-semibold text-gray-800">Manage Students</h2>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar icon={<UserOutlined />} className="bg-purple-600" />
              <span className="text-gray-700">{user?.name || 'Admin'}</span>
            </div>
          </Dropdown>
        </Header>

        <Content className="p-6 bg-gray-50">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Students</h3>
              <Search
                placeholder="Search by Student ID or name"
                onSearch={handleSearch}
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
              />
            </div>
            <Table
              columns={columns}
              dataSource={students}
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              rowKey="_id"
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
