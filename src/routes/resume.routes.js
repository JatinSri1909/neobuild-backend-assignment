const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { extractTextFromPDF } = require('../services/pdf');
const { analyzeResume } = require('../services/gemini');
const { encrypt, decrypt } = require('../services/crypto');
const Applicant = require('../models/applicant.model');

// Store URL to _id mappings
const urlToIdMap = new Map();

// Resume enrichment endpoint
router.post('/enrich', authMiddleware, async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ 
                status: 'error',
                error: 'PDF URL is required' 
            });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                error: 'Invalid URL format'
            });
        }

        // Check if URL has been processed before
        const existingId = urlToIdMap.get(url);
        let isUpdate = false;

        if (existingId) {
            isUpdate = true;
            console.log(`URL was previously processed with ID: ${existingId}`);
        }

        // Validate if URL ends with .pdf
        if (!url.toLowerCase().endsWith('.pdf')) {
            return res.status(400).json({
                status: 'error',
                error: 'URL must point to a PDF file'
            });
        }

        // Extract and analyze text from PDF
        let text;
        try {
            text = await extractTextFromPDF(url);
        } catch (error) {
            if (error.message.includes('404')) {
                return res.status(404).json({
                    status: 'error',
                    error: 'PDF file not found at the provided URL'
                });
            }
            if (error.message.includes('403')) {
                return res.status(403).json({
                    status: 'error',
                    error: 'Access denied to PDF file'
                });
            }
            if (error.message.includes('No text data detected')) {
                return res.status(422).json({
                    status: 'error',
                    error: 'No readable text found in PDF'
                });
            }
            throw error; // Let other errors be handled by the main catch block
        }

        let resumeData;
        try {
            resumeData = await analyzeResume(text);
        } catch (error) {
            return res.status(422).json({
                status: 'error',
                error: 'Failed to analyze resume content',
                details: error.message
            });
        }

        // Validate and encrypt data
        const requiredFields = ['name', 'email', 'education', 'experience', 'skills'];
        const missingFields = requiredFields.filter(field => !resumeData[field]);
        if (missingFields.length > 0) {
            return res.status(422).json({
                status: 'error',
                error: 'Incomplete resume data',
                missingFields
            });
        }

        let encryptedName, encryptedEmail;
        try {
            encryptedName = encrypt(resumeData.name);
            encryptedEmail = encrypt(resumeData.email);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                error: 'Encryption failed',
                details: 'Failed to secure sensitive data'
            });
        }

        let response;

        if (isUpdate) {
            // Update existing record
            try {
                const updatedData = {
                    ...resumeData,
                    name: encryptedName,
                    email: encryptedEmail
                };

                const updatedApplicant = await Applicant.findByIdAndUpdate(
                    existingId,
                    updatedData,
                    { new: true } // Return updated document
                );

                if (!updatedApplicant) {
                    // If record not found (might have been deleted), create new
                    isUpdate = false;
                } else {
                    response = updatedApplicant.toObject();
                    response.name = decrypt(response.name);
                    response.email = decrypt(response.email);

                    return res.status(200).json({
                        status: 'success',
                        message: 'Resume updated successfully',
                        data: response
                    });
                }
            } catch (error) {
                return res.status(500).json({
                    status: 'error',
                    error: 'Failed to update resume',
                    details: error.message
                });
            }
        }

        if (!isUpdate) {
            // Create new record
            resumeData.name = encryptedName;
            resumeData.email = encryptedEmail;
            const applicant = new Applicant(resumeData);
            
            try {
                const savedApplicant = await applicant.save();
                // Store URL to ID mapping
                urlToIdMap.set(url, savedApplicant._id);

                // Decrypt sensitive data for response
                resumeData.name = decrypt(encryptedName);
                resumeData.email = decrypt(encryptedEmail);

                return res.status(201).json({
                    status: 'success',
                    message: 'Resume processed successfully',
                    data: resumeData
                });
            } catch (error) {
                return res.status(500).json({
                    status: 'error',
                    error: 'Database error',
                    details: 'Failed to save resume data'
                });
            }
        }
    } catch (error) {
        console.error('Resume enrichment error:', error);
        return res.status(500).json({ 
            status: 'error',
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Resume search endpoint
router.post('/search', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ 
                error: 'Name is required for search'
            });
        }

        if (typeof name !== 'string') {
            return res.status(400).json({ 
                error: 'Name must be a string'
            });
        }

        // First get all applicants
        const allApplicants = await Applicant.find({});
        
        // Decrypt and filter with better error handling
        const matchingApplicants = allApplicants.filter(applicant => {
            try {
                const decryptedName = decrypt(applicant.name);
                // Case insensitive search
                return decryptedName.toLowerCase().includes(name.toLowerCase());
            } catch (error) {
                console.error('Error decrypting name:', error);
                return false; // Skip this record if decryption fails
            }
        });

        if (!matchingApplicants.length) {
            return res.status(404).json({ 
                message: 'No matching records found'
            });
        }

        // Decrypt all sensitive data before sending
        const decryptedApplicants = matchingApplicants.map(applicant => {
            try {
                const decrypted = applicant.toObject();
                decrypted.name = decrypt(decrypted.name);
                decrypted.email = decrypt(decrypted.email);
                return decrypted;
            } catch (error) {
                console.error('Error decrypting applicant data:', error);
                return null;
            }
        }).filter(Boolean); // Remove any null entries from failed decryption

        return res.status(200).json({
            message: 'Search completed successfully',
            count: decryptedApplicants.length,
            data: decryptedApplicants
        });
    } catch (error) {
        console.error('Resume search error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

module.exports = router;