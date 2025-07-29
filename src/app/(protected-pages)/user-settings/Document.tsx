'use client';

import { useMemo, useState, useEffect } from 'react';
import DataTable, { ColumnDef } from '@/components/shared/DataTable';
import { Input, Select } from '@/components/ui';
import Button from '@/components/ui/Button';
import { Dialog } from '@/components/ui';
import axios from 'axios';
import { toast } from 'react-toastify';

type DocumentStatus = 'Verified' | 'Unverified';

type Document = {
    id: number;
    customerId: number;
    type: string;
    document: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
};

const documentTypeOptions = [
    { label: 'Passport', value: 'Passport' },
    { label: 'IDCard', value: 'IDCard' },
    { label: 'Others', value: 'Others' },
];

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const getAuthToken = () => localStorage.getItem('authToken') || '';

const DocumentComponent = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<DocumentStatus | ''>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [docType, setDocType] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<{ docType?: string; file?: string }>({});

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/user/auth/document/fetch`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });
            if (response.data.code === 200) {
                setDocuments(response.data.data);
            } else {
                alert('Failed to fetch documents');
            }
        } catch (err) {
            alert('Error fetching documents');
        } finally {
            setLoading(false);
        }
    };

    const uploadDocument = async (formData: FormData) => {
        try {
            setUploading(true);
            const response = await axios.post(`${BASE_URL}/user/auth/document`, formData, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Document uploaded!');
            fetchDocuments();
            setIsDialogOpen(false);
        } catch {
            toast.error('Error uploading document');
            return false;
        } finally {
            setUploading(false);
        }
    };

    const openDialog = () => {
        setIsDialogOpen(true);
        setDocType('');
        setFile(null);
        setErrors({});
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setDocType('');
        setFile(null);
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: typeof errors = {};

        if (!docType) newErrors.docType = 'Document type is required.';
        if (!file) newErrors.file = 'Document file is required.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const formData = new FormData();
        formData.append('type', docType);
        formData.append('document', file!);

        const success = await uploadDocument(formData);
        if (success) closeDialog();
    };

    const filteredDocuments = useMemo(() => {
        if (!filter) return documents;
        return documents.filter(doc => (doc.verified ? 'Verified' : 'Unverified') === filter);
    }, [documents, filter]);

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

    const columns: ColumnDef<Document>[] = [
        { header: 'Id', accessorKey: 'id' },
        {
            header: 'Document',
            accessorKey: 'document',
            cell: ({ row }) => {
                const fileName = row.original.document;
                return (
                    <a
                        href={`${BASE_URL}/uploads/document/${fileName}`}
                        className="text-blue-700 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {fileName}
                    </a>
                );
            },
        },
        { header: 'Type', accessorKey: 'type' },
        {
            header: 'Upload Date',
            accessorKey: 'createdAt',
            cell: ({ row }) => formatDate(row.original.createdAt),
        },
        {
            header: 'Status',
            accessorKey: 'verified',
            cell: ({ row }) => (
                <span className={`text-sm px-2 py-1 rounded font-medium ${row.original.verified ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                    {row.original.verified ? 'Verified' : 'Unverified'}
                </span>
            ),
        },
    ];

    return (
        <div className=" mt-5 p-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={openDialog} size='sm' className="rounded-md"  variant='solid' disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Document'}
                </Button>

                <Select
                    options={[
                        { label: 'All', value: '' },
                        { label: 'Verified', value: 'Verified' },
                        { label: 'Unverified', value: 'Unverified' },
                    ]}
                    value={filter ? { label: filter, value: filter } : { label: 'All', value: '' }}
                    onChange={(opt) => setFilter(opt?.value as DocumentStatus | '')}
                    placeholder="Filter by status"
                    className="w-48"
                />
            </div>

            <DataTable<Document>
                columns={columns}
                data={filteredDocuments}
                pagingData={{ total: filteredDocuments.length, pageIndex: 1, pageSize: 10 }}
                loading={loading}
                noData={filteredDocuments.length === 0}
            />

            <Dialog isOpen={isDialogOpen} onClose={closeDialog}>
                <form onSubmit={handleSubmit} className="p-4 space-y-4 w-full max-w-lg mx-auto">
                    <h2 className="text-xl font-semibold">Upload Document</h2>

                    <div>
                        <label className="block text-sm font-medium mb-1">Document Type</label>
                        <Select
                            options={documentTypeOptions}
                            value={documentTypeOptions.find(opt => opt.value === docType) || null}
                            onChange={(opt) => setDocType(opt?.value || '')}
                            isClearable={false}
                        />
                        {errors.docType && <p className="text-red-600 text-sm mt-1">{errors.docType}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Upload File</label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full border border-gray-200 p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                        />
                        {errors.file && <p className="text-red-600 text-sm mt-1">{errors.file}</p>}
                    </div>

                    <div className="flex  gap-2">
                        <Button type="submit" className="rounded-lg font-normal px-6 py-1" variant='solid' size='sm' disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Submit'}
                        </Button>

                    </div>
                </form>
            </Dialog>
        </div>
    );
};

export default DocumentComponent;
