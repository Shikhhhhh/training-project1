import { useState, useEffect } from 'react';
import { 
  Layout, Menu, Table, Button, Modal, Form, Input, InputNumber, 
  Select, DatePicker, Tag, Avatar, Dropdown, Space, message 
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
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { clearAuth, getUser } from '../../services/auth';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;

export default function AdminJobs() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [form] = Form.useForm();
  
  const [collapsed, setCollapsed] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

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
          <h2 className="text-xl font-semibold text-gray-800">Manage Jobs</h2>
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
              <h3 className="text-lg font-semibold">Job Postings</h3>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create Job
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={jobs}
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              rowKey="_id"
              scroll={{ x: 1200 }}
            />
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
    </Layout>
  );
}
