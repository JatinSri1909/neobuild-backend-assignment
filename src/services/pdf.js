const axios = require('axios');
const pdf = require('pdf-parse');

async function extractTextFromPDF(url) {
    try {
        // Fetch PDF file from URL
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'Accept': 'application/pdf'
            }
        });

        // Extract text from PDF
        const data = await pdf(Buffer.from(response.data));
        
        // Clean and normalize the extracted text
        let text = data.text || '';
        text = text.replace(/\s+/g, ' ')  // Replace multiple spaces with single space
                  .replace(/\n+/g, '\n')  // Replace multiple newlines with single newline
                  .trim();

        if (!text) {
            throw new Error('No text data detected in the PDF file');
        }

        return text;
    } catch (error) {
        console.error('PDF extraction error:', error);
        
        if (error.response?.status === 404) {
            throw new Error('PDF file not found');
        }
        if (error.response?.status === 403) {
            throw new Error('Access to PDF file denied');
        }
        if (error.message.includes('No text data detected')) {
            throw error;
        }
        
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}

module.exports = { extractTextFromPDF };