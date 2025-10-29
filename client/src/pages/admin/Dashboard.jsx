import { Layout, Card, Statistic, Row, Col, Button } from 'antd';
import { UserOutlined, FileTextOutlined, CheckCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import { clearAuth } from '../../services/auth';
import { useNavigate } from 'react-router-dom';

// ... rest of the component


const { Header, Content } = Layout;

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </Header>

      <Content className="p-6 bg-gray-50">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, Admin! 👋</h2>
          <p className="text-gray-600">Manage your internship portal</p>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="rounded-xl shadow-md hover:shadow-lg transition">
              <Statistic
                title="Total Students"
                value={0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card className="rounded-xl shadow-md hover:shadow-lg transition">
              <Statistic
                title="Total Applications"
                value={0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card className="rounded-xl shadow-md hover:shadow-lg transition">
              <Statistic
                title="Verified Profiles"
                value={0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        <div className="mt-8 bg-white rounded-xl p-8 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <p className="text-gray-600">Admin features coming soon...</p>
        </div>
      </Content>
    </Layout>
  );
}
