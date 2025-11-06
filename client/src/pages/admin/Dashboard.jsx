// Modern Admin Dashboard - MetaMask Inspired
import { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, Skeleton } from 'antd';
import {
  CheckCircleOutlined,
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { adminAPI } from '../../services/api';
import { getUser } from '../../services/auth';
import StatsCard from '../../components/admin/StatsCard';
import AdminLayout from '../../components/common/AdminLayout';

export default function AdminDashboard() {
  const user = getUser();
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

  return (
    <AdminLayout>
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
                <div className="bg-purple-600/20 dark:bg-purple-500/20 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl mb-6 border border-purple-300/30 dark:border-purple-400/30">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800 dark:text-white">
                    Welcome back, {user?.name || 'Admin'}! 👋
                  </h1>
                  <p className="text-gray-700 dark:text-gray-200 text-lg">
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
                        <div className="w-2 h-2 bg-purple-500/50 rounded-full"></div>
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
                                  className="h-full bg-purple-500/60 backdrop-blur-sm rounded-full transition-all duration-500"
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
                        <div className="w-2 h-2 bg-cyan-500/50 rounded-full"></div>
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
                                  className="h-full bg-cyan-500/60 backdrop-blur-sm rounded-full transition-all duration-500"
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
    </AdminLayout>
  );
}
