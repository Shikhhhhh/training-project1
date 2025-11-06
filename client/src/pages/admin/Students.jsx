// Modern Admin Students Page - MetaMask Inspired
import { useState, useEffect } from 'react';
import { Table, Input, Button, Tag, Avatar, Switch, message, Modal, Descriptions, Spin, App } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  FileTextOutlined,
  LinkOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/common/AdminLayout';

const { Search } = Input;

export default function AdminStudents() {
  const { modal } = App.useApp();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const data = await adminAPI.getStudents({ page, limit: 10, search });
      console.log('Students data received:', data);
      if (data.success) {
        setStudents(data.profiles || []);
        setPagination({
          current: data.currentPage || page,
          pageSize: 10,
          total: data.total || 0,
        });
      } else {
        console.error('API returned success: false', data);
        setStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
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

  const handleViewDetails = async (student) => {
    setSelectedStudent(student);
    setDetailsModalVisible(true);
    setLoadingDetails(true);
    try {
      const data = await adminAPI.getStudent(student.user?._id);
      if (data.success) {
        setStudentDetails(data.profile || student);
      } else {
        setStudentDetails(student);
      }
    } catch (error) {
      console.error('Failed to fetch student details:', error);
      setStudentDetails(student);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteStudent = (student) => {
    // Extract user ID - MUST be user._id, not profile._id
    // The backend expects a user ID, not a profile ID
    let userId = student.user?._id || student.user?.id;
    
    // Handle case where user might be an ObjectId reference string
    if (!userId && student.user) {
      // If user is populated as an object with _id property
      userId = student.user._id;
    }
    
    // If still no user ID, try to get it from the user field directly
    if (!userId && typeof student.user === 'string') {
      userId = student.user;
    }
    
    // If no user ID found, we cannot proceed
    if (!userId) {
      console.error('Student record structure:', {
        hasUser: !!student.user,
        userType: typeof student.user,
        userValue: student.user,
        profileId: student._id,
        fullRecord: student
      });
      message.error('Unable to find user ID in student record. Cannot delete without user ID.');
      return;
    }
    
    // Convert to string if it's an object
    if (typeof userId === 'object' && userId.toString) {
      userId = userId.toString();
    }
    
    console.log('Delete student called with:', { 
      studentName: student.user?.name || 'Unknown',
      userId,
      userIdType: typeof userId,
      userObject: student.user,
      profileId: student._id
    });

    modal.confirm({
      title: 'Delete Student',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ${student.user?.name || 'this student'}? This action cannot be undone and will delete their profile, applications, and account.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          console.log('Deleting student with ID:', userId);
          const result = await adminAPI.deleteStudent(userId);
          console.log('Delete student result:', result);
          message.success('Student deleted successfully');
          fetchStudents(pagination.current);
        } catch (error) {
          console.error('Delete student error:', error);
          message.error(error.message || 'Failed to delete student');
          throw error; // Re-throw to prevent modal from closing on error
        }
      },
    });
  };

  const columns = [
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            src={record.user?.profilePicture} 
            icon={<UserOutlined />}
            className="bg-purple-500/30 backdrop-blur-md border border-purple-400/30"
          />
          <div>
            <div className="font-medium text-gray-800 dark:text-gray-100">{record.user?.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{record.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Program',
      dataIndex: 'program',
      key: 'program',
      className: 'text-gray-700 dark:text-gray-300',
    },
    {
      title: 'CGPA',
      dataIndex: 'cgpa',
      key: 'cgpa',
      sorter: (a, b) => a.cgpa - b.cgpa,
      className: 'text-gray-700 dark:text-gray-300',
    },
    {
      title: 'Graduation Year',
      dataIndex: 'graduationYear',
      key: 'graduationYear',
      className: 'text-gray-700 dark:text-gray-300',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag color={record.isComplete ? 'green' : 'orange'} className="rounded-full px-3 py-1">
            {record.completionPercentage}% Complete
          </Tag>
          <Tag color={record.verifiedFlags?.resumeVerified ? 'green' : 'orange'} className="rounded-full px-3 py-1">
            {record.verifiedFlags?.resumeVerified ? 'Resume Verified' : 'Resume Unverified'}
          </Tag>
          <Tag 
            color={record.isVerified ? 'blue' : 'gray'} 
            className="rounded-full px-3 py-1 font-semibold"
          >
            {record.isVerified ? '✓ Verified Student' : 'Unverified'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Verify Student</span>
            <Switch
              checked={record.isVerified || false}
              onChange={async (checked) => {
                try {
                  await adminAPI.verifyStudent(record.user?._id, checked);
                  message.success(checked ? 'Student verified successfully' : 'Student verification removed');
                  fetchStudents(pagination.current);
                } catch (e) {
                  message.error(e.message || 'Failed to update student verification');
                }
              }}
              className="min-w-[44px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Verify Resume</span>
            <Switch
              checked={record.verifiedFlags?.resumeVerified || false}
              onChange={async (checked) => {
                try {
                  await adminAPI.verifyResume(record.user?._id, checked);
                  message.success(checked ? 'Resume verified' : 'Resume unverified');
                  fetchStudents(pagination.current);
                } catch (e) {
                  message.error('Failed to update resume verification');
                }
              }}
              className="min-w-[44px]"
            />
          </div>
          <Button 
            size="small" 
            type="link"
            onClick={() => handleViewDetails(record)}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            View Details
          </Button>
          <Button 
            size="small" 
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteStudent(record)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl p-6 md:p-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
              All Students
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Manage and view all student profiles
            </p>
          </div>
          <Search
            placeholder="Search by Student ID or name"
            onSearch={handleSearch}
            className="modern-search"
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
            size="large"
          />
        </div>
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
          <Table
            columns={columns}
            dataSource={students}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} students`,
              className: 'modern-pagination',
            }}
            onChange={handleTableChange}
            rowKey={(record) => record._id || record.user?._id || `${record._id}-${Date.now()}`}
            className="modern-table"
            rowClassName="hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-colors"
          />
        </div>
      </div>

      {/* Student Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/30 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <UserOutlined className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-0">
                Student Details
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-0">
                Complete profile information
              </p>
            </div>
          </div>
        }
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedStudent(null);
          setStudentDetails(null);
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
        {loadingDetails ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : studentDetails ? (
          <div className="p-6">
            {/* Header Section */}
            <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
              <Avatar 
                size={80}
                src={studentDetails.user?.profilePicture}
                icon={<UserOutlined />}
                className="bg-purple-500/30 backdrop-blur-md border border-purple-400/30"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {studentDetails.user?.name || 'N/A'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {studentDetails.user?.email || 'N/A'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Tag color={studentDetails.isComplete ? 'green' : 'orange'} className="rounded-full px-3 py-1">
                    {studentDetails.completionPercentage}% Complete
                  </Tag>
                  <Tag color={studentDetails.verifiedFlags?.resumeVerified ? 'green' : 'orange'} className="rounded-full px-3 py-1">
                    {studentDetails.verifiedFlags?.resumeVerified ? 'Resume Verified' : 'Resume Unverified'}
                  </Tag>
                  <Tag color={studentDetails.isVerified ? 'blue' : 'gray'} className="rounded-full px-3 py-1">
                    {studentDetails.isVerified ? '✓ Verified Student' : 'Unverified'}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <Descriptions
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              className="mb-6 student-details-descriptions"
            >
              <Descriptions.Item label="Program">
                <span className="text-gray-800 dark:text-gray-200">{studentDetails.program || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="CGPA">
                <span className="text-gray-800 dark:text-gray-200">{studentDetails.cgpa || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Graduation Year">
                <span className="text-gray-800 dark:text-gray-200">{studentDetails.graduationYear || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                <span className="text-gray-800 dark:text-gray-200">{studentDetails.user?.department || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Skills" span={2}>
                {studentDetails.skills && studentDetails.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {studentDetails.skills.map((skill, idx) => (
                      <Tag key={idx} color="purple" className="rounded-full">
                        {skill}
                      </Tag>
                    ))}
                  </div>
                ) : <span className="text-gray-600 dark:text-gray-400">No skills added</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Resume" span={2}>
                {studentDetails.resumeUrl ? (
                  <a
                    href={studentDetails.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2"
                  >
                    <FileTextOutlined />
                    <span>View Resume</span>
                    <LinkOutlined />
                  </a>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">No resume uploaded</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="GitHub">
                {studentDetails.githubUrl ? (
                  <a
                    href={studentDetails.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2"
                  >
                    <span>GitHub Profile</span>
                    <LinkOutlined />
                  </a>
                ) : <span className="text-gray-600 dark:text-gray-400">N/A</span>}
              </Descriptions.Item>
              <Descriptions.Item label="LinkedIn">
                {studentDetails.linkedinUrl ? (
                  <a
                    href={studentDetails.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2"
                  >
                    <span>LinkedIn Profile</span>
                    <LinkOutlined />
                  </a>
                ) : <span className="text-gray-600 dark:text-gray-400">N/A</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Portfolio">
                {studentDetails.portfolioUrl ? (
                  <a
                    href={studentDetails.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2"
                  >
                    <span>Portfolio Website</span>
                    <LinkOutlined />
                  </a>
                ) : <span className="text-gray-600 dark:text-gray-400">N/A</span>}
              </Descriptions.Item>
              {studentDetails.bio && (
                <Descriptions.Item label="Bio" span={2}>
                  <span className="text-gray-800 dark:text-gray-200">{studentDetails.bio}</span>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Projects Section */}
            {studentDetails.projects && studentDetails.projects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Projects</h3>
                <div className="space-y-4">
                  {studentDetails.projects.map((project, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{project.title}</h4>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                          >
                            <LinkOutlined />
                          </a>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{project.description}</p>
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.technologies.map((tech, techIdx) => (
                            <Tag key={techIdx} color="blue" className="rounded-full text-xs">
                              {tech}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Verification Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Student Verified:</span>
                  <Tag color={studentDetails.isVerified ? 'green' : 'default'}>
                    {studentDetails.isVerified ? (
                      <><CheckCircleOutlined /> Verified</>
                    ) : (
                      'Not Verified'
                    )}
                  </Tag>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Resume Verified:</span>
                  <Tag color={studentDetails.verifiedFlags?.resumeVerified ? 'green' : 'default'}>
                    {studentDetails.verifiedFlags?.resumeVerified ? (
                      <><CheckCircleOutlined /> Verified</>
                    ) : (
                      'Not Verified'
                    )}
                  </Tag>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Academic Verified:</span>
                  <Tag color={studentDetails.verifiedFlags?.academicVerified ? 'green' : 'default'}>
                    {studentDetails.verifiedFlags?.academicVerified ? (
                      <><CheckCircleOutlined /> Verified</>
                    ) : (
                      'Not Verified'
                    )}
                  </Tag>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Identity Verified:</span>
                  <Tag color={studentDetails.verifiedFlags?.identityVerified ? 'green' : 'default'}>
                    {studentDetails.verifiedFlags?.identityVerified ? (
                      <><CheckCircleOutlined /> Verified</>
                    ) : (
                      'Not Verified'
                    )}
                  </Tag>
                </div>
                {studentDetails.verifiedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Verified At:</span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {new Date(studentDetails.verifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-600 dark:text-gray-400">
            No student details available
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
