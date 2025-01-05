import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const { data } = await axios.get('http://localhost:5000/api/documents', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setDocuments(data);
            } catch (error) {
                console.error('Failed to fetch documents:', error);
                navigate('/');
            }
        };
        fetchDocuments();
    }, [navigate]);

    return (
        <div className="container my-5">
            <h2 className="text-center text-primary mb-4">Dashboard</h2>
            <div className="row g-4">
                {documents.map((doc) => (
                    <div key={doc._id} className="col-md-6 col-lg-4">
                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title text-truncate fw-bold" title={doc.title}>
                                    {doc.title}
                                </h5>
                                <p className="card-text text-muted small">
                                    Created on: {new Date(doc.createdAt).toLocaleDateString()}
                                </p>
                                <Link
                                    to={`/document/${doc._id}`}
                                    className="btn btn-outline-primary mt-auto"
                                >
                                    Open Document
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center mt-4">
                <button
                    className="btn btn-success btn-lg"
                    onClick={() => navigate('/document/new')}
                >
                    Create New Document
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
