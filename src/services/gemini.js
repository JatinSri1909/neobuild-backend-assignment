const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY } = require('../config');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function analyzeResume(text) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `
        Analyze this resume text and extract information in a structured format.
        
        Resume text:
        ${text}
        
        Instructions:
        1. Extract only factual information present in the resume
        2. Use "Not specified" for any missing required fields
        3. Format the response as a valid JSON object
        4. Ensure all dates are in YYYY-MM format
        5. Keep the skills list concise (max 10 skills)
        
        Return ONLY a JSON object in this exact format:
        {
            "name": "full name",
            "email": "email address",
            "education": {
                "degree": "highest degree",
                "branch": "specialization",
                "institution": "university name",
                "year": "graduation year"
            },
            "experience": {
                "job_title": "most recent job title",
                "company": "company name",
                "start_date": "YYYY-MM",
                "end_date": "YYYY-MM or Present"
            },
            "skills": ["skill1", "skill2", "skill3"],
            "summary": "brief professional summary"
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let responseText = response.text();

        // Find the JSON object in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON found in response');
        }

        // Parse and validate the JSON
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        const requiredFields = {
            name: 'Not specified',
            email: 'Not specified',
            education: {
                degree: 'Not specified',
                branch: 'Not specified',
                institution: 'Not specified',
                year: 'Not specified'
            },
            experience: {
                job_title: 'Not specified',
                company: 'Not specified',
                start_date: 'Not specified',
                end_date: 'Not specified'
            },
            skills: [],
            summary: 'Not specified'
        };

        // Merge with defaults for any missing fields
        const validatedData = {
            ...requiredFields,
            ...parsedData,
            education: { ...requiredFields.education, ...parsedData.education },
            experience: { ...requiredFields.experience, ...parsedData.experience }
        };

        return validatedData;
    } catch (error) {
        console.error('Resume analysis error:', error);
        throw new Error('Failed to analyze resume: ' + error.message);
    }
}

module.exports = { analyzeResume };