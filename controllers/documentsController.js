const Document = require('../models/Document');
const { body, validationResult } = require("express-validator");

// Error handler middleware
const handleError = (res, error, message = "Server error") => {
    console.error(message, error);
    res.status(500).json({ message });
};

// Get all documents
module.exports.allDocuments = async (req, res) => {
    try {
        const documents = await Document.find({}).sort({ createdAt: -1 });
        res.status(200).json(documents);
    } catch (error) {
        handleError(res, error, 'Error fetching documents');
    }
};

// Get a single document
module.exports.getSingleDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.status(200).json(document);
    } catch (error) {
        handleError(res, error, 'Error fetching document');
    }
};

// Create a new document
module.exports.createDocuments = [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
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
                owner: req.user ? req.user.id : null, // Owner is optional
            });
            res.status(201).json(newDocument);
        } catch (error) {
            handleError(res, error, 'Error creating document');
        }
    }
];

// Update a document
module.exports.updateDocuments = [
    body("title").optional().notEmpty().withMessage("Title must not be empty"),
    body("content").optional().notEmpty().withMessage("Content must not be empty"),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content } = req.body;
        try {
            const document = await Document.findById(req.params.id);
            if (!document) {
                return res.status(404).json({ message: "Document not found" });
            }

            document.title = title || document.title;
            document.content = content || document.content;
            const updatedDocument = await document.save();
            res.status(200).json(updatedDocument);
        } catch (error) {
            handleError(res, error, "Error updating document");
        }
    }
];

// Delete a document
module.exports.deleteDocuments = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        await Document.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        handleError(res, error, "Error deleting document");
    }
};
