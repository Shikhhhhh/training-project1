import { Card, Descriptions, Tag, Button, Upload, message, Modal, Avatar } from 'antd';
import {
  EditOutlined,
  UploadOutlined,
  FileTextOutlined,
  GithubOutlined,
  LinkedinOutlined,
  GlobalOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { uploadAPI, studentAPI } from '../../services/api';
import { useState, useEffect } from 'react';

export default function ProfileView({ profile, onEdit, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [cacheKey, setCacheKey] = useState(Date.now());

  // Update cache key when profile picture changes
  useEffect(() => {
    if (profile?.user?.profilePicture) {
      setCacheKey(Date.now());
    }
  }, [profile?.user?.profilePicture]);

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="mb-6">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Profile Found</h3>
        <p className="text-gray-600 mb-6">Create your profile to get started with internship applications</p>
        <Button type="primary" size="large" icon={<EditOutlined />} onClick={onEdit}>
          Create Profile
        </Button>
      </div>
    );
  }

  const handleProfilePictureUpload = async (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }

    setUploading(true);

    try {
      const res = await uploadAPI.uploadProfilePicture(file);

      if (res.success) {
        message.success('Profile picture uploaded successfully!');
        
        // Refresh profile data from server
        if (onRefresh) {
          await onRefresh();
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleResumeUpload = async (file) => {
    const isPDF = file.type === 'application/pdf';
    const isDoc = file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (!isPDF && !isDoc) {
      message.error('You can only upload PDF or Word documents!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return false;
    }

    setUploading(true);
    try {
      const data = await uploadAPI.uploadResume(file);
      if (data.success) {
        await studentAPI.updateProfile({ resumeUrl: data.file.url });
        message.success('Resume uploaded successfully!');
        onRefresh();
      }
    } catch (error) {
      message.error(error.message || 'Resume upload failed');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleDeleteProfile = () => {
    Modal.confirm({
      title: 'Delete Profile',
      content: 'Are you sure you want to delete your profile? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await studentAPI.deleteProfile();
          message.success('Profile deleted successfully');
          onRefresh();
        } catch (error) {
          message.error(error.message || 'Delete failed');
        }
      },
    });
  };

  // ✅ FIX: Read from profile.user (not profile.userId) and add cache buster
  const profilePicUrl = profile?.user?.profilePicture 
    ? `${profile.user.profilePicture}?v=${cacheKey}`
    : null;

  console.log('🖼️ Avatar URL:', profilePicUrl);
  console.log('📦 Profile user:', profile?.user);

  return (
    <div className="space-y-6">
      {/* Header Card with Profile Picture */}
      <Card className="rounded-2xl shadow-lg border-0">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              {/* ✅ FIX: Conditional rendering - only use Avatar with src when URL exists */}
              {profilePicUrl ? (
                <Avatar
                  size={128}
                  src={profilePicUrl}
                  className="border-4 border-purple-500 shadow-lg"
                />
              ) : (
                <Avatar
                  size={128}
                  icon={<UserOutlined />}
                  className="border-4 border-purple-500 shadow-lg bg-gray-200"
                />
              )}
              
              {/* Upload Button Overlay */}
              <div className="absolute bottom-0 right-0">
                <Upload
                  beforeUpload={handleProfilePictureUpload}
                  showUploadList={false}
                  accept="image/*"
                  maxCount={1}
                >
                  <Button
                    icon={<UploadOutlined />}
                    size="small"
                    loading={uploading}
                    className="rounded-full bg-purple-600 text-white border-0 hover:bg-purple-700"
                    type="primary"
                  >
                    {profilePicUrl ? 'Change' : 'Upload'}
                  </Button>
                </Upload>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Max 5MB</p>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {profile.user?.name || 'Student'}
                </h2>
                <p className="text-gray-600">{profile.user?.email}</p>
                <p className="text-gray-500 text-sm">{profile.user?.department}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={onEdit}
                  className="bg-purple-600 hover:bg-purple-700 border-0"
                >
                  Edit
                </Button>
                <Button danger icon={<DeleteOutlined />} onClick={handleDeleteProfile}>
                  Delete
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Tag color={profile.isComplete ? 'success' : 'warning'} className="px-3 py-1">
                {profile.completionPercentage || 0}% Complete
              </Tag>
              {profile.verifiedFlags?.resumeVerified && <Tag color="green">Resume Verified</Tag>}
            </div>
          </div>
        </div>
      </Card>

      {/* Details Card */}
      <Card title="📋 Profile Information" className="rounded-2xl shadow-lg border-0">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Program">{profile.program || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Graduation Year">{profile.graduationYear || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="CGPA">{profile.cgpa || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Bio" span={2}>
            {profile.bio || 'No bio added yet'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Skills */}
      <Card title="💡 Skills" className="rounded-2xl shadow-lg border-0">
        <div className="flex flex-wrap gap-2">
          {profile.skills && profile.skills.length > 0 ? (
            profile.skills.map((skill, idx) => (
              <Tag key={idx} color="blue" className="px-3 py-1 text-sm">
                {skill}
              </Tag>
            ))
          ) : (
            <p className="text-gray-500">No skills added yet</p>
          )}
        </div>
      </Card>

      {/* Links */}
      <Card title="🔗 Social Links" className="rounded-2xl shadow-lg border-0">
        <div className="space-y-3">
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <GithubOutlined className="text-xl" />
              <span>GitHub Profile</span>
            </a>
          )}
          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <LinkedinOutlined className="text-xl" />
              <span>LinkedIn Profile</span>
            </a>
          )}
          {profile.portfolioUrl && (
            <a
              href={profile.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <GlobalOutlined className="text-xl" />
              <span>Portfolio Website</span>
            </a>
          )}
          {!profile.githubUrl && !profile.linkedinUrl && !profile.portfolioUrl && (
            <p className="text-gray-500">No links added yet</p>
          )}
        </div>
      </Card>

      {/* Resume */}
      <Card title="📄 Resume" className="rounded-2xl shadow-lg border-0">
        {profile.resumeUrl ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileTextOutlined className="text-2xl text-blue-600" />
              <span>Resume uploaded</span>
              {profile.verifiedFlags?.resumeVerified && <Tag color="success">Verified</Tag>}
            </div>
            <div className="flex gap-2">
              <Button href={profile.resumeUrl} target="_blank">
                View
              </Button>
              <Upload beforeUpload={handleResumeUpload} showUploadList={false} accept=".pdf,.doc,.docx">
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Re-upload
                </Button>
              </Upload>
            </div>
          </div>
        ) : (
          <Upload beforeUpload={handleResumeUpload} showUploadList={false} accept=".pdf,.doc,.docx">
            <Button icon={<UploadOutlined />} type="dashed" block size="large" loading={uploading}>
              Upload Resume (PDF/DOCX)
            </Button>
          </Upload>
        )}
      </Card>
    </div>
  );
}
