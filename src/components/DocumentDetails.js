import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getDocumentById, updateDocument, deleteDocument } from '../services/DcServices';
import { io } from 'socket.io-client';

const DocumentDetails = () => {
    const socket = io('http://localhost:5000');
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const location = useLocation();
    const message = location.state?.message;

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const doc = await getDocumentById(id);
                setDocument(doc);
                setTitle(doc.title);
                setContent(doc.content);
            } catch (error) {
                setError('Failed to fetch document');
            }
        };
        fetchDocument();
    }, [id]);

    useEffect(() => {
        socket.emit('joinDocument', id);

        socket.on('receiveUpdate', (updatedData) => {
            if (updatedData.title) setTitle(updatedData.title);
            if (updatedData.content) setContent(updatedData.content);
        });

        return () => {
            socket.disconnect();
        };
    }, [id, socket]);

    const handleUpdate = async () => {
        try {
            await updateDocument(id, { title, content });
            socket.emit('documentUpdate', { documentId: id, title, content });
            setSuccessMessage('Document updated successfully!');
            navigate(`/dashboard`);
        } catch (error) {
            setError('Failed to update document');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDocument(id);
            navigate('/dashboard');
        } catch (error) {
            setError('Failed to delete document');
        }
    };

    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!document) return <div>Loading...</div>;

    return (
        <div className="container mt-4" style={{ maxWidth: '600px' }}>
            {message && <div className="alert alert-success">{message}</div>}
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <h4 className="text-center text-primary mb-3">Document Details</h4>
                    <div className="form-group mb-3">
                        <label htmlFor="title" className="form-label">Title</label>
                        <input
                            type="text"
                            id="title"
                            className="form-control"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                socket.emit('documentUpdate', { documentId: id, title: e.target.value, content });
                            }}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="content" className="form-label">Content</label>
                        <textarea
                            id="content"
                            className="form-control"
                            rows="4"
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                socket.emit('documentUpdate', { documentId: id, title, content: e.target.value });
                            }}
                        />
                    </div>
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    <div className="d-flex justify-content-between mt-3">
                        <button className="btn btn-primary btn-sm" onClick={handleUpdate}>
                            Update
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentDetails;
