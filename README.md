# Resume Analysis API

A mini backend using Node.js/Express.js for a fictional resume analysis app.

## Tech Stack

- **Backend Framework**: Express.js
- **Database**: MongoDB (cloud version)
- **LLM API**: Google Gemini
- **Deployment**: Vercel/Render/Railway

## API Endpoints

### 1. Authentication API

Authenticate user & authorize service via JWT

- **Endpoint**: `/api/auth/login`
- **Method**: POST
- **Body**:
  ```json
  {
    "username": "<username>",
    "password": "<password>"
  }
  ```
- **Credentials**:
  ```json
  {
    "username": "naval.ravikant",
    "password": "05111974"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "JWT": "<JWT>"
  }
  ```
- **Error Response**:
  ```json
  {
    "error": "<error>"
  }
  ```

### 2. Resume Data Enrichment API

Extract text from PDF URL & store in database

- **Endpoint**: `/api/resume/enrich`
- **Method**: POST
- **Headers**: `Authorization: Bearer <JWT>`
- **Body**:
  ```json
  {
    "url": "<url>"
  }
  ```
- **Response Format**:
  ```json
  {
    "name": "<name>",
    "email": "<email>",
    "education": {
      "degree": "<degree>",
      "branch": "<branch>",
      "institution": "<institution>",
      "year": "<year>"
    },
    "experience": {
      "job_title": "<job_title>",
      "company": "<company>",
      "start_date": "<start_date>",
      "end_date": "<end_date>"
    },
    "skills": [
      "<skill_1>",
      "<skill_2>",
      "..."
    ],
    "summary": "<summary>"
  }
  ```

### 3. Resume Search API

Search resumes by name

- **Endpoint**: `/api/resume/search`
- **Method**: POST
- **Headers**: `Authorization: Bearer <JWT>`
- **Body**:
  ```json
  {
    "name": "<name>"
  }
  ```
- **Features**:
  - Case-insensitive search
  - Token-agnostic (e.g., 'raj' matches 'Raj Singh', 'Vanraj Mehta', 'Prem Raj')

## Implementation Details

- Separate routes for each API
- JWT-based authentication
- Data encryption for sensitive fields (name & email)
- PDF text extraction
- LLM-based resume analysis
- Environment variables for sensitive keys

## Testing

- Test URL: https://www.dhli.in/uploaded_files/resumes/resume_3404.pdf
- Use Postman for API testing

## Contact

For any queries or clarifications, contact:
- **Name**: Ayush Soni
- **Email**: ayush.soni@neobuild.tech
- **Phone**: +91 9307576314

## Submission

- Share deployed project link OR
- Share Postman collection + Github repo link
- Deadline: 3 days (can be extended by 1-2 days with prior notice)