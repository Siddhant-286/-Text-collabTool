import axios from 'axios';

const API_URL = 'http://localhost:5000/api/documents';

// Function to get the token from localStorage
const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.token : null;
};

// Get all documents
export const getDocuments = async () => {
    const token = getToken();
    if (!token) {
        throw new Error('User not authenticated');
    }

    try {
        const { data } = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    } catch (error) {
        console.error('Failed to fetch documents:', error);
        throw error;
    }
};

// Get a document by ID
export const getDocumentById = async (id) => {
    const token = getToken();
    if (!token) {
        throw new Error('User not authenticated');
    }

    try {
        const { data } = await axios.get(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    } catch (error) {
        console.error(`Failed to fetch document with ID ${id}:`, error);
        throw error;
    }
};

// Update a document by ID
export const updateDocument = async (id, documentData) => {
    const token = getToken();
    if (!token) {
        throw new Error('User not authenticated');
    }

    try {
        const { data } = await axios.put(`${API_URL}/${id}`, documentData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    } catch (error) {
        console.error(`Failed to update document with ID ${id}:`, error);
        throw error;
    }
};

// Delete a document by ID
export const deleteDocument = async (id) => {
    const token = getToken();
    if (!token) {
        throw new Error('User not authenticated');
    }

    try {
        const { data } = await axios.delete(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    } catch (error) {
        console.error(`Failed to delete document with ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

