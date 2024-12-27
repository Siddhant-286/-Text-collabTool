const express = require('express');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { verifyToken } = require('../utils/helper');
const { validateDocument } = require('../utils/validetor');
const router = express.Router();

// Error handler middleware
const handleError = (res, error, message = 'Server error') => {
    console.error(message, error);
    res.status(500).json({ message });
};

// Get all documents for the logged-in user
router.get('/', verifyToken, async (req, res) => {
    try {
        const documents = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(documents);
    } catch (error) {
        handleError(res, error, 'Error fetching documents');
    }
});

// Get a single document by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        if (document.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this document' });
        }
        res.status(200).json(document);
    } catch (error) {
        handleError(res, error, 'Error fetching document');
    }
});

// Create a new document
router.post(
    '/',
    verifyToken,validateDocument ,
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('content').notEmpty().withMessage('Content is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content } = req.body;
        try {
            const newDocument = await Document.create({
                title,
                content,
                owner: req.user.id,
            });
            res.status(201).json(newDocument);
        } catch (error) {
            handleError(res, error, 'Error creating document');
        }
    }
);

// Update a document
router.put(
    '/:id',
    verifyToken,validateDocument,
    [
        body('title').optional().notEmpty().withMessage('Title must not be empty'),
        body('content').optional().notEmpty().withMessage('Content must not be empty'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content } = req.body;
        try {
            const document = await Document.findById(req.params.id);
            if (!document) {
                return res.status(404).json({ message: 'Document not found' });
            }
            if (document.owner.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to update this document' });
            }

            document.title = title || document.title;
            document.content = content || document.content;
            const updatedDocument = await document.save();
            res.status(200).json(updatedDocument);
        } catch (error) {
            handleError(res, error, 'Error updating document');
        }
    }
);

// Delete a document
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        if (document.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this document' });
        }

        await document.remove();
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        handleError(res, error, 'Error deleting document');
    }
});

module.exports = router;
