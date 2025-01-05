import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DocumentForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) {
                console.error('User not authenticated');
                return;
            }
            const token = user.token;

            const { data } = await axios.post('http://localhost:5000/api/documents', { title, content }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            navigate(`/dashboard`, { state: { message: 'Document created successfully!' } });
        } catch (error) {
            console.error('Failed to create document:', error);
        }
    };

    return (
        <div className="container mt-5 d-flex justify-content-center"
        >
            <div
                className="card shadow-sm border-0 rounded-3"
                style={{ maxWidth: '500px', width: '100%', padding: '20px' }}
            >
                <div className="card-body">
                    <h2 className="text-center text-primary fw-semibold mb-3" style={{ fontSize: '1.5rem' }}>
                        Create Document
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label fw-bold" style={{ fontSize: '0.9rem' }}>
                                Title
                            </label>
                            <input
                                type="text"
                                className="form-control rounded-2"
                                id="title"
                                placeholder="Enter the title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                style={{ fontSize: '0.9rem' }}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="content" className="form-label fw-bold" style={{ fontSize: '0.9rem' }}>
                                Content
                            </label>
                            <textarea
                                className="form-control rounded-2"
                                id="content"
                                rows="5"
                                placeholder="Write your content here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                style={{ fontSize: '0.9rem' }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 rounded-2"
                            style={{ fontSize: '0.95rem', padding: '10px' }}
                        >
                            Create Document
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DocumentForm;
