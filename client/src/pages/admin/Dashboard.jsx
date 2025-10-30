import { useState, useEffect } from 'react';
import { Layout, Avatar, Badge } from 'antd';
import { UserOutlined, BellOutlined, MenuOutlined } from '@ant-design/icons';
import ProfileView from '../../components/student/ProfileView';
import ProfileForm from '../../components/student/ProfileForm';

const { Header, Content } = Layout;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add this

  // Load user data
  const loadUser = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    console.log('📊 Loading user data:', userData); // Debug log
    setUser(userData);
  };

  useEffect(() => {
    loadUser();

    // Listen for profile picture updates
    const handleProfileUpdate = () => {
      console.log('🔄 Profile picture updated event received');
      loadUser();
      setRefreshKey(prev => prev + 1); // Force re-render
    };

    window.addEventListener('profilePictureUpdated', handleProfileUpdate);

    // Also listen to storage events (if updated in another tab)
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const handleProfileSuccess = () => {
    setIsEditing(false);
    loadUser();
    setRefreshKey(prev => prev + 1);
  };

  

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header className="bg-white shadow-sm px-6 flex items-center justify-between" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <MenuOutlined className="text-xl cursor-pointer" />
        
        <div className="flex items-center gap-6">
          <Badge count={0} showZero>
            <BellOutlined className="text-xl cursor-pointer" />
          </Badge>

          <div className="flex items-center gap-3 cursor-pointer">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {user?.name || 'Student'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || 'email@example.com'}
              </p>
            </div>
            
            {/* Dynamic Profile Picture with key to force refresh */}
            <Avatar 
              key={`header-avatar-${refreshKey}`}
              size={48}
              src={user?.profilePicture}
              icon={!user?.profilePicture && <UserOutlined />}
              className="bg-purple-500 shadow-md"
            />
          </div>
        </div>
      </Header>

      {/* Content */}
      <Content className="p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
          
          {/* Profile Header with Dynamic Avatar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Left Side Avatar - Dynamic with key */}
              <Avatar 
                key={`profile-avatar-${refreshKey}`}
                size={64}
                src={user?.profilePicture}
                icon={!user?.profilePicture && <UserOutlined />}
                className="bg-purple-500 shadow-lg"
              />
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student</h1>
                <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm">
                  60% Complete
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                ✏️ Edit
              </button>
              <button className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors">
                🗑️ Delete
              </button>
            </div>
          </div>

          {/* Profile Content */}
          {isEditing ? (
            <ProfileForm 
              profile={user} 
              onSuccess={handleProfileSuccess}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ProfileView 
              key={`profile-view-${refreshKey}`}
              profile={user} 
              onEdit={() => setIsEditing(true)}
              onRefresh={() => {
                loadUser();
                setRefreshKey(prev => prev + 1);
              }}
            />
          )}
        </div>
      </Content>
    </Layout>
  );
}
