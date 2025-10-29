import { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, message } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { studentAPI } from '../../services/api';
import { PROGRAMS, SKILLS_LIST } from '../../utils/constants';

// ... rest of the component


const { TextArea } = Input;

export default function ProfileForm({ profile, onSuccess, onCancel }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const data = profile
        ? await studentAPI.updateProfile(values)
        : await studentAPI.createProfile(values);

      if (data.success) {
        message.success(profile ? 'Profile updated successfully!' : 'Profile created successfully!');
        onSuccess();
      }
    } catch (error) {
      message.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">{profile ? '✏️ Edit Profile' : '➕ Create Profile'}</span>
        </div>
      }
      extra={
        <Button icon={<CloseOutlined />} onClick={onCancel}>
          Cancel
        </Button>
      }
      className="rounded-2xl shadow-lg border-0"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={profile || {}}
        onFinish={handleSubmit}
        requiredMark="optional"
        className="max-w-4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Program */}
          <Form.Item
            name="program"
            label={<span className="font-semibold">Program</span>}
            rules={[{ required: true, message: 'Please enter your program' }]}
          >
            <Input
              size="large"
              placeholder="e.g., B.Tech Computer Science"
              maxLength={100}
              className="rounded-lg"
            />
          </Form.Item>

          {/* Graduation Year */}
          <Form.Item
            name="graduationYear"
            label={<span className="font-semibold">Graduation Year</span>}
            rules={[
              { required: true, message: 'Please enter graduation year' },
              { type: 'number', min: 2020, max: 2030, message: 'Year must be between 2020-2030' },
            ]}
          >
            <InputNumber
              size="large"
              min={2020}
              max={2030}
              placeholder="2025"
              className="w-full rounded-lg"
            />
          </Form.Item>

          {/* CGPA */}
          <Form.Item
            name="cgpa"
            label={<span className="font-semibold">CGPA</span>}
            rules={[{ type: 'number', min: 0, max: 10, message: 'CGPA must be between 0-10' }]}
          >
            <InputNumber
              size="large"
              min={0}
              max={10}
              step={0.01}
              placeholder="8.5"
              className="w-full rounded-lg"
            />
          </Form.Item>

          {/* Skills */}
          <Form.Item
            name="skills"
            label={<span className="font-semibold">Skills (Max 20)</span>}
          >
            <Select
              mode="tags"
              size="large"
              placeholder="Add or select skills"
              maxTagCount={20}
              className="rounded-lg"
              options={SKILLS_LIST.map((skill) => ({ label: skill, value: skill }))}
            />
          </Form.Item>
        </div>

        {/* Bio */}
        <Form.Item
          name="bio"
          label={<span className="font-semibold">Bio</span>}
          rules={[{ max: 500, message: 'Bio cannot exceed 500 characters' }]}
        >
          <TextArea
            rows={4}
            placeholder="Tell us about yourself, your interests, and career goals..."
            maxLength={500}
            showCount
            className="rounded-lg"
          />
        </Form.Item>

        {/* Links Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">🔗 Social Links</h3>
          <div className="space-y-4">
            <Form.Item
              name="githubUrl"
              label={<span className="font-medium">GitHub Profile</span>}
              rules={[
                {
                  pattern: /^(https?:\/\/(www\.)?github\.com\/.+)?$/,
                  message: 'Please enter a valid GitHub URL',
                },
              ]}
            >
              <Input
                size="large"
                placeholder="https://github.com/yourusername"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="linkedinUrl"
              label={<span className="font-medium">LinkedIn Profile</span>}
              rules={[
                {
                  pattern: /^(https?:\/\/(www\.)?linkedin\.com\/.+)?$/,
                  message: 'Please enter a valid LinkedIn URL',
                },
              ]}
            >
              <Input
                size="large"
                placeholder="https://linkedin.com/in/yourusername"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="portfolioUrl"
              label={<span className="font-medium">Portfolio Website</span>}
              rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
            >
              <Input
                size="large"
                placeholder="https://yourportfolio.com"
                className="rounded-lg"
              />
            </Form.Item>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
            size="large"
            className="px-8 rounded-lg"
          >
            {profile ? 'Update Profile' : 'Create Profile'}
          </Button>
          <Button size="large" onClick={onCancel} className="rounded-lg">
            Cancel
          </Button>
        </div>
      </Form>
    </Card>
  );
}
