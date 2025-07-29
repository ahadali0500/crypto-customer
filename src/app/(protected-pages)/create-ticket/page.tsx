'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import RichTextEditor from '@/components/shared/RichTextEditor';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui';

const CreateTicket = () => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editorKey, setEditorKey] = useState<number>(0);
  const [err, setErr] = useState({ subject: '', description: '' }); // validation errors
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const handleEditorChange = (content: { text: string; html: string; json: any }) => {
    setDescription(content.html);
  };

  const validateForm = () => {
    const errors = { subject: '', description: '' };

    if (!subject.trim()) {
      errors.subject = 'Subject is required';
    }
    if (!description.trim() || description === '<p><br></p>') {
      errors.description = 'Description is required';
    }

    setErr(errors);

    // true if no errors
    return Object.values(errors).every((error) => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('message', description);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/ticket/create`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      toast.success('Ticket created successfully!');
      setSubject('');
      setDescription('');
      setEditorKey((prev) => prev + 1);
      setErr({ subject: '', description: '' });
    } catch (error: any) {
      console.error('Error submitting ticket:', error?.response?.data || error.message);
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[95%] md:w-[90%] mx-auto p-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Create Ticket</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject
          </label>
          <Input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border border-gray-200 focus:ring-0 bg-gray-100 dark:bg-gray-800 rounded-lg"
            placeholder="Enter subject here..."
          />
          {err.subject && <p className="text-red-500 text-sm mt-1">{err.subject}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <RichTextEditor
            key={editorKey}
            onChange={handleEditorChange}
            editorContentClass="min-h-[200px]"
            content=""
          />
          {err.description && <p className="text-red-500 text-sm mt-1">{err.description}</p>}
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;
