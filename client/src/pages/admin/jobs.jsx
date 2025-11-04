import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Table, Button, Modal, Form, Input, InputNumber, 
  Select, DatePicker, Tag, Avatar, Dropdown, Space, message, List, Spin 
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LogoutOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { clearAuth, getUser } from '../../services/auth';
import { useTheme } from '../../components/common/ThemeProvider';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;

export default function AdminJobs() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const { isDark, toggleTheme } = useTheme();
  const [form] = Form.useForm();
  
  const [collapsed, setCollapsed] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [applicationsModalVisible, setApplicationsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminAPI.getJobs({ page, limit: 10 });
      if (data.success) {
        console.log('Fetched jobs:', data.jobs);
        setJobs(data.jobs);
        setPagination({
          current: data.pagination?.page || 1,
          pageSize: 10,
          total: data.pagination?.total || data.jobs?.length || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      message.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchJobs(newPagination.current);
  };

  const handleCreate = () => {
    setEditingJob(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    form.setFieldsValue({
      title: job.title,
      company: job.companyName,  // ✅ Map companyName to company field
      description: job.description,
      type: job.jobType,  // ✅ Map jobType to type field
      location: job.location,
      duration: job.duration?.value,
      stipend: job.stipend?.min,
      applicationDeadline: job.applicationDeadline ? dayjs(job.applicationDeadline) : null,
      status: job.status,
      requirements: job.skills?.join(', '),
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Job',
      content: 'Are you sure you want to delete this job posting?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await adminAPI.deleteJob(id);
          message.success('Job deleted successfully');
          fetchJobs(pagination.current);
        } catch (error) {
          message.error(error.message || 'Failed to delete job');
        }
      },
    });
  };

  const handleViewApplications = async (job) => {
    setSelectedJob(job);
    setApplicationsModalVisible(true);
    setLoadingApplications(true);
    try {
      console.log('Fetching applications for job:', job._id);
      const data = await adminAPI.getJobApplications(job._id);
      console.log('Applications data received:', data);
      if (data.success) {
        setApplications(data.applications || []);
        if (data.applications && data.applications.length === 0) {
          message.info('No applications found for this job');
        }
      } else {
        message.error(data.error || 'Failed to load applications');
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      message.error(error.message || 'Failed to load applications');
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const jobData = {
        title: values.title,
        company: values.company,  // ✅ Frontend sends 'company'
        description: values.description,
        type: values.type,  // ✅ Frontend sends 'type'
        location: values.location,
        duration: values.duration,
        stipend: values.stipend,
        applicationDeadline: values.applicationDeadline?.toISOString(),
        status: values.status,
        requirements: values.requirements,
      };

      console.log('Submitting job data:', jobData);

      if (editingJob) {
        await adminAPI.updateJob(editingJob._id, jobData);
        message.success('Job updated successfully');
      } else {
        await adminAPI.createJob(jobData);
        message.success('Job created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchJobs(pagination.current);
    } catch (error) {
      message.error(error.message || 'Failed to save job');
    }
  };

  const columns = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text) => <span className="font-medium">{text || 'N/A'}</span>,
    },
    {
      title: 'Company',
      dataIndex: 'companyName',  // ✅ Changed from 'company' to 'companyName'
      key: 'companyName',
      width: 150,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Type',
      dataIndex: 'jobType',  // ✅ Changed from 'type' to 'jobType'
      key: 'jobType',
      width: 120,
      render: (jobType) => {
        if (!jobType) return 'N/A';  // ✅ Null check
        
        const colorMap = {
          'internship': 'blue',
          'full-time': 'green',
          'part-time': 'orange',
          'contract': 'purple',
        };
        
        return (
          <Tag color={colorMap[jobType] || 'default'}>
            {jobType.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        if (!status) return 'N/A';  // ✅ Null check
        
        return (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Deadline',
      dataIndex: 'applicationDeadline',
      key: 'deadline',
      width: 140,
      render: (date) => (date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'),
    },
    {
      title: 'Applications',
      key: 'applications',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewApplications(record)}
        >
          View ({record.applicationCount || 0})
        </Button>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            title="Delete"
          />
        </Space>
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
    <Layout className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
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
          style={{ backgroundColor: 'transparent' }}
        />
      </Sider>

      <Layout>
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
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Manage Jobs</h2>
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

        <Content className="p-6 md:p-8 bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl p-6 md:p-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  Job Postings
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Manage and track all job opportunities
                </p>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 border-0 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                style={{
                  borderRadius: '12px',
                  padding: '0 24px',
                  height: '44px',
                }}
              >
                Create Job
              </Button>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
              <Table
                columns={columns}
                dataSource={jobs}
                loading={loading}
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} jobs`,
                  className: 'modern-pagination',
                }}
                onChange={handleTableChange}
                rowKey="_id"
                scroll={{ x: 1200 }}
                className="modern-table"
                rowClassName="hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-colors"
              />
            </div>
          </div>
        </Content>
      </Layout>

      {/* Create/Edit Modal */}
      <Modal
        title={editingJob ? 'Edit Job' : 'Create Job'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={700}
        okText={editingJob ? 'Update' : 'Create'}
        okButtonProps={{ className: 'bg-purple-600 hover:bg-purple-700' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Job Title"
            rules={[{ required: true, message: 'Please enter job title' }]}
          >
            <Input placeholder="e.g. Frontend Developer Intern" />
          </Form.Item>

          <Form.Item
            name="company"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="e.g. Google" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Job Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} placeholder="Describe the role, responsibilities, etc." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Job Type"
              rules={[{ required: true, message: 'Please select job type' }]}
            >
              <Select placeholder="Select type">
                <Select.Option value="internship">Internship</Select.Option>
                <Select.Option value="fulltime">Full Time</Select.Option>
                <Select.Option value="parttime">Part Time</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: 'Please enter location' }]}
            >
              <Input placeholder="e.g. Bangalore, Remote" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="duration"
              label="Duration (months)"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <InputNumber min={1} max={24} className="w-full" />
            </Form.Item>

            <Form.Item
              name="stipend"
              label="Stipend/Salary"
              rules={[{ required: true, message: 'Please enter stipend' }]}
            >
              <InputNumber
                min={0}
                className="w-full"
                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/₹\s?|(,*)/g, '')}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="applicationDeadline"
              label="Application Deadline"
              rules={[{ required: true, message: 'Please select deadline' }]}
            >
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select placeholder="Select status">
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="closed">Closed</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="requirements" label="Requirements (comma separated)">
            <Input placeholder="React, Node.js, MongoDB" />
          </Form.Item>
          </Form>
      </Modal>

      {/* Applications Modal - Glassmorphic */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <EyeOutlined className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-0">
                Applications for {selectedJob?.title || 'Job'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-0">
                View all students who applied for this position
              </p>
            </div>
          </div>
        }
        open={applicationsModalVisible}
        onCancel={() => {
          setApplicationsModalVisible(false);
          setSelectedJob(null);
          setApplications([]);
        }}
        footer={null}
        width={900}
        className="modern-modal"
        styles={{
          content: {
            borderRadius: '24px',
            padding: 0,
          },
        }}
      >
        {loadingApplications ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : applications.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No applications yet for this job.
          </div>
        ) : (
          <div className="p-6">
            <List
              dataSource={applications}
              renderItem={(application, index) => (
                <List.Item
                  className="bg-white dark:bg-slate-800/50 rounded-xl mb-3 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  style={{ 
                    padding: '20px',
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={56}
                        icon={<UserOutlined />}
                        className="bg-gradient-to-br from-purple-500 to-indigo-500 shadow-md"
                      />
                    }
                    title={
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg text-gray-800 dark:text-gray-100">
                          {application.studentId?.name || 'Unknown Student'}
                        </span>
                        <Tag 
                          color={application.status === 'pending' ? 'orange' : 'green'}
                          className="px-3 py-1 rounded-full font-semibold"
                        >
                          {application.status?.toUpperCase() || 'PENDING'}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="space-y-2 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">📧 Email:</span>
                          <span>{application.studentId?.email || 'N/A'}</span>
                        </div>
                        {application.studentId?.department && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">🏫 Department:</span>
                            <span>{application.studentId.department}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-medium">📅 Applied on:</span>
                          <span>{dayjs(application.appliedAt || application.createdAt).format('MMM DD, YYYY HH:mm')}</span>
                        </div>
                        {application.stage && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">🎯 Stage:</span>
                            <Tag className="rounded-full">{application.stage}</Tag>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </Layout>
  );
}
