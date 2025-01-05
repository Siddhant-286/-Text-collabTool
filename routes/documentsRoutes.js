const express = require("express");
const { verifyToken } = require("../utils/helper");
const { validateDocument } = require("../utils/validetor");
const documentController  = require("../controllers/documentsController");
const router = express.Router();


// Get all documents or createdocuments for the logged-in user 
router
  .get("/", verifyToken, documentController.allDocuments)
  .post("/", verifyToken, validateDocument, documentController.createDocuments);

// Get a single document by ID
router.get("/:id", verifyToken, documentController.getSingleDocument);

// Update a document
router.put(
  "/:id",
  verifyToken,
  validateDocument, documentController.updateDocuments);

// Delete a document
router.delete("/:id", verifyToken, documentController.deleteDocuments);

module.exports = router;
