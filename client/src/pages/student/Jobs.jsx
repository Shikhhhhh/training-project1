import { useState, useEffect } from 'react';
import { Card, Button, Tag, Input, Select, message, Empty, Skeleton } from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  FolderOutlined,
  FilterOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { jobAPI, studentAPI } from '../../services/api';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

// Skeleton Loader Component
const JobCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Skeleton.Input active size="small" className="mb-2 w-3/4" />
        <Skeleton.Input active size="small" className="w-1/2" />
      </div>
      <Skeleton.Button active size="small" shape="round" className="w-20" />
    </div>
    <Skeleton paragraph={{ rows: 2 }} active className="mb-4" />
    <div className="space-y-2">
      <Skeleton.Input active size="small" className="w-2/3" />
      <Skeleton.Input active size="small" className="w-1/2" />
    </div>
    <Skeleton.Button active block className="mt-4" />
  </div>
);

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [locationTypeFilter, setLocationTypeFilter] = useState('');
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        status: 'active',
        page: 1,
        limit: 50,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (jobTypeFilter) params.jobType = jobTypeFilter;
      if (locationTypeFilter) params.locationType = locationTypeFilter;

      const data = await jobAPI.getJobs(params);
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (error) {
      message.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const data = await studentAPI.getMyApplications();
      if (data.success && data.applications) {
        const appliedJobIds = data.applications.map(app => {
          return app.jobId?._id || app.jobId || app.job?._id || app.job;
        }).filter(Boolean);
        setAppliedJobs(new Set(appliedJobIds));
      }
    } catch (error) {
      console.error('Failed to fetch applied jobs');
    }
  };

  const handleApply = async (jobId) => {
    setApplyingJobId(jobId);
    try {
      const data = await jobAPI.applyForJob(jobId);
      if (data.success) {
        message.success({
          content: 'Application submitted successfully!',
          duration: 3,
          className: 'success-toast',
        });
        setAppliedJobs(new Set([...appliedJobs, jobId]));
        await fetchAppliedJobs();
      }
    } catch (error) {
      message.error(error.message || 'Failed to apply for job');
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleSearch = () => {
    fetchJobs();
  };

  const handleFilterChange = () => {
    fetchJobs();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setJobTypeFilter('');
    setLocationTypeFilter('');
    setTimeout(() => fetchJobs(), 100);
  };

  const formatStipend = (stipend) => {
    if (!stipend) return 'Not specified';
    if (stipend.min === stipend.max) {
      return `₹${stipend.min.toLocaleString()}`;
    }
    return `₹${stipend.min.toLocaleString()} - ₹${stipend.max.toLocaleString()}`;
  };

  const getJobTypeConfig = (type) => {
    const configs = {
      'internship': { 
        color: 'bg-blue-500/30 backdrop-blur-sm', 
        text: 'INTERNSHIP',
        icon: '🎓'
      },
      'full-time': { 
        color: 'bg-emerald-500/30 backdrop-blur-sm', 
        text: 'FULL-TIME',
        icon: '💼'
      },
      'part-time': { 
        color: 'bg-amber-500/30 backdrop-blur-sm', 
        text: 'PART-TIME',
        icon: '⏰'
      },
      'contract': { 
        color: 'bg-purple-500/30 backdrop-blur-sm', 
        text: 'CONTRACT',
        icon: '📋'
      },
    };
    return configs[type] || { color: 'bg-gray-500/30 backdrop-blur-sm', text: type?.toUpperCase() || 'N/A', icon: '📌' };
  };

  const hasActiveFilters = searchTerm || jobTypeFilter || locationTypeFilter;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section with Glassmorphism */}
      <div className="relative overflow-hidden bg-purple-600/20 dark:bg-purple-500/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 mb-8 shadow-2xl border border-purple-300/30 dark:border-purple-400/30">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <FolderOutlined className="text-2xl text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Find Your Perfect Opportunity
            </h1>
          </div>
          <p className="text-xl text-white/90 mb-6 max-w-2xl">
            Discover internships and jobs tailored to your skills and aspirations
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-white font-semibold">
              {jobs.length} Active Opportunities
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-white font-semibold">
              {appliedJobs.size} Applications Submitted
            </div>
          </div>
        </div>
      </div>

      {/* Modern Filter Section with Glassmorphism */}
      <div className="mb-8">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl p-6 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FilterOutlined className="text-purple-600 dark:text-purple-400 text-xl" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Filters</h2>
            </div>
            {hasActiveFilters && (
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={clearFilters}
                className="text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Search
                placeholder="Search by title, company, or skills..."
                allowClear
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={handleSearch}
                className="modern-search"
                enterButton={
                  <Button 
                    type="primary" 
                    className="bg-purple-600/80 dark:bg-purple-500/80 backdrop-blur-md border-0 hover:bg-purple-700/80 dark:hover:bg-purple-600/80 transition-all duration-200 hover:scale-105 text-white"
                  >
                    <SearchOutlined />
                  </Button>
                }
              />
            </div>
            
            <Select
              placeholder="Job Type"
              size="large"
              allowClear
              value={jobTypeFilter}
              onChange={(value) => {
                setJobTypeFilter(value);
                handleFilterChange();
              }}
              className="modern-select"
              suffixIcon={<FolderOutlined className="text-purple-600" />}
            >
              <Option value="internship">🎓 Internship</Option>
              <Option value="full-time">💼 Full Time</Option>
              <Option value="part-time">⏰ Part Time</Option>
              <Option value="contract">📋 Contract</Option>
            </Select>

            <Select
              placeholder="Location Type"
              size="large"
              allowClear
              value={locationTypeFilter}
              onChange={(value) => {
                setLocationTypeFilter(value);
                handleFilterChange();
              }}
              className="modern-select"
              suffixIcon={<EnvironmentOutlined className="text-purple-600" />}
            >
              <Option value="remote">🌐 Remote</Option>
              <Option value="onsite">🏢 Onsite</Option>
              <Option value="hybrid">🔀 Hybrid</Option>
            </Select>
          </div>
        </div>
      </div>

      {/* Jobs Grid with Modern Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            No Jobs Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your filters or check back later for new opportunities
          </p>
          {hasActiveFilters && (
            <Button
              type="primary"
              size="large"
              onClick={clearFilters}
              className="bg-purple-600/80 dark:bg-purple-500/80 backdrop-blur-md border-0 hover:bg-purple-700/80 dark:hover:bg-purple-600/80 text-white"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => {
            const jobTypeConfig = getJobTypeConfig(job.jobType);
            const isApplied = appliedJobs.has(job._id);
            const isApplying = applyingJobId === job._id;

            return (
              <div
                key={job._id}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Gradient Accent Bar */}
                <div className={`h-1 ${jobTypeConfig.color} w-full`}></div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {job.companyName}
                      </p>
                    </div>
                    <div className={`ml-3 px-3 py-1 ${jobTypeConfig.color} border border-white/20 rounded-full text-gray-800 dark:text-white text-xs font-bold flex items-center gap-1`}>
                      <span>{jobTypeConfig.icon}</span>
                      <span>{jobTypeConfig.text}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Job Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <EnvironmentOutlined className="text-purple-600 dark:text-purple-400" />
                      <span className="font-medium">{job.location}</span>
                      {job.locationType && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-md text-xs">
                          {job.locationType}
                        </span>
                      )}
                    </div>
                    
                    {job.stipend && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <DollarOutlined className="text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatStipend(job.stipend)}
                        </span>
                      </div>
                    )}

                    {job.applicationDeadline && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <CalendarOutlined className="text-amber-600 dark:text-amber-400" />
                        <span>Deadline: {dayjs(job.applicationDeadline).format('MMM DD, YYYY')}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills Tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                          +{job.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Apply Button */}
                  <Button
                    type={isApplied ? 'default' : 'primary'}
                    icon={isApplied ? <CheckCircleOutlined /> : <FileTextOutlined />}
                    loading={isApplying}
                    disabled={isApplied || job.status !== 'active'}
                    onClick={() => handleApply(job._id)}
                    block
                    size="large"
                    className={`
                      ${isApplied 
                        ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-slate-600' 
                        : 'bg-purple-600/80 dark:bg-purple-500/80 backdrop-blur-md border-0 text-white hover:bg-purple-700/80 dark:hover:bg-purple-600/80'
                      }
                      transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-semibold h-12 rounded-xl shadow-md hover:shadow-lg
                    `}
                  >
                    {isApplied ? '✓ Applied' : 'Apply Now'}
                  </Button>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-purple-500/0 group-hover:bg-purple-500/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
