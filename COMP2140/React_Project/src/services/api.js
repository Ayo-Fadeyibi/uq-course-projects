// Base URL for the Interview App RESTful API
const API_BASE_URL = 'https://comp2140a2.uqcloud.net/api';

// JWT token for authorization, replace with your actual token from My Grades in Blackboard
// From the A2 JSON Web Token column, view Feedback to show your JWT
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4ODQ1ODkifQ.Ak4QrzWC7QWyZ8zWZYDWJLVvmihYx1vXe8Pcjr8pibA';

// Your UQ student username, used for row-level security to retrieve your records
const USERNAME = 's4884589';

/**
 * Helper function to handle API requests.
 * It sets the Authorization token and optionally includes the request body.
 * 
 * @param {string} endpoint - The API endpoint to call.
 * @param {string} [method='GET'] - The HTTP method to use (GET, POST, PATCH).
 * @param {object} [body=null] - The request body to send, typically for POST or PATCH.
 * @returns {Promise<object>} - The JSON response from the API.
 * @throws Will throw an error if the HTTP response is not OK.
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method, // Set the HTTP method (GET, POST, PATCH)
    headers: {
      'Content-Type': 'application/json', // Indicate that we are sending JSON data
      'Authorization': `Bearer ${JWT_TOKEN}` // Include the JWT token for authentication
    },
  };

  // If the method is POST or PATCH, we want the response to include the full representation
  if (method === 'POST' || method === 'PATCH') {
    options.headers['Prefer'] = 'return=representation';
  }

  // If a body is provided, add it to the request and include the username
  if (body) {
    options.body = JSON.stringify({ ...body, username: USERNAME });
  }

  // Make the API request and check if the response is OK
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (method === "DELETE") {
    return true;
  }
  
  // Return the response as a JSON object
  return response.json();
}

/**
 * Function to insert a new project into the database.
 * 
 * @param {object} project - The project data to insert.
 * @returns {Promise<object>} - The created project object returned by the API.
 */
export async function createInterview(interview) {
  return apiRequest('/interview', 'POST', interview);
}

/**
 * Function to insert a new question into the database.
 * 
 * @param {object} project - The project data to insert.
 * @returns {Promise<object>} - The created project object returned by the API.
 */
export async function createQuestion(question) {
  return apiRequest('/question', 'POST', question);
}

/**
 * Function to insert a new applicant into the database.
 * 
 * @param {object} project - The project data to insert.
 * @returns {Promise<object>} - The created project object returned by the API.
 */
export async function createApplicant(applicant) {
  return apiRequest('/applicant', 'POST', applicant);
}

/**
 * Function to insert a new applicant answer into the database.
 * 
 * @param {object} applicantAnswer - The answer data to insert.
 * @returns {Promise<object>} - The created applicant answer object returned by the API.
 */
export async function createApplicantAnswer(applicantAnswer) {
  return apiRequest('/applicant_answer', 'POST', applicantAnswer);
}


/**
 * Function to delete project from the database.
 * 
 * @param {object} project - The project data to insert.
 * @returns {Promise<object>} - The created project object returned by the API.
 */
export async function deleteInterview(id) {
  return apiRequest(`/interview?id=eq.${id}`, 'DELETE');
}

/**
 * Function to delete question from the database.
 * 
 * @param {object} project - The project data to insert.
 * @returns {Promise<object>} - The created project object returned by the API.
 */
export async function deleteQuestion(id) {
  return apiRequest(`/question?id=eq.${id}`, 'DELETE');
}

/**
 * Function to delete applicant from the database.
 * 
 * @param {object} project - The project data to insert.
 * @returns {Promise<object>} - The created project object returned by the API.
 */
export async function deleteApplicant(id) {
  return apiRequest(`/applicant?id=eq.${id}`, 'DELETE');
}

// PATCH to update a single interview
export async function updateInterview(id, data) {
  return apiRequest(`/interview?id=eq.${id}`, "PATCH", data);
}

// PATCH to update a single interview
export async function updateQuestion(id, data) {
  return apiRequest(`/question?id=eq.${id}`, "PATCH", data);
}

// PATCH to update a single applicant
export async function updateApplicant(id, data) {
  return apiRequest(`/applicant?id=eq.${id}`, "PATCH", data);
}


/**
 * Function to list all projects associated with the current user.
 * 
 * @returns {Promise<Array>} - An array of project objects.
 */
export async function getInterviews() {
  return apiRequest('/interview');
}

/**
 * Function to list all questions associated with the current user.
 * 
 * @returns {Promise<Array>} - An array of project objects.
 */
export async function getQuestions() {
  return apiRequest('/question');
}

/**
 * Function to list all applicants associated with the current user.
 * 
 * @returns {Promise<Array>} - An array of project objects.
 */
export async function getApplicants() {
  return apiRequest('/applicant');
}

/**
 * Function to get a single project by its ID.
 * The url is slightly different from usual RESTFul ...
 * See the operators section https://docs.postgrest.org/en/v12/references/api/tables_views.html
 * @param {string} id - The ID of the project to retrieve.
 * @returns {Promise<object>} - The project object matching the ID.
 */
export async function getInterview(id) {
  return apiRequest(`/interview?id=eq.${id}`);
}

/**
 * Function to get a single question by its ID.
 * The url is slightly different from usual RESTFul ...
 * See the operators section https://docs.postgrest.org/en/v12/references/api/tables_views.html
 * @param {string} id - The ID of the project to retrieve.
 * @returns {Promise<object>} - The project object matching the ID.
 */
export async function getQuestion(id) {
  return apiRequest(`/question?id=eq.${id}`);
}

/**
 * Function to get a single applicant by its ID.
 * The url is slightly different from usual RESTFul ...
 * See the operators section https://docs.postgrest.org/en/v12/references/api/tables_views.html
 * @param {string} id - The ID of the project to retrieve.
 * @returns {Promise<object>} - The project object matching the ID.
 */
export async function getApplicant(id) {
  return apiRequest(`/applicant?id=eq.${id}`);
}

/**
 * Main function to demonstrate API usage.
 * 
 * Creates a new interview, lists all interviews, and retrieves a single interview by ID.
 */
async function main() {
  try {
    // Create a new interview with specific details
    const newInterview = {
      title: 'Front-end Developer Interview',
      job_role: 'Mid-level Front-end Developer',
      description: 'Interview focusing on React, JavaScript fundamentals, and responsive design principles.',
      status: 'Draft', // The interview is not published initially (Draft status)
    };
    const createdInterview = await createInterview(newInterview);
    console.log('Created Interview:', createdInterview);

    // Retrieve and list all interviews associated with your account
    const allInterviews = await getInterviews();
    console.log('All Interviews:', allInterviews);

    // If there are interviews, retrieve the first one by its ID
    if (allInterviews.length > 0) {
      const singleInterview = await getInterview(allInterviews[0].id);
      console.log('Single Interview:', singleInterview);
    }

    // Further functionality for other endpoints like /question can be added here...
    // Create a new question with specific details
    const newQuestion = {
      interview_id:'107', 
      question: 'Tell me about your experience with react',
      difficulty: 'Easy'
    };
    const createdQuestion = await createQuestion(newQuestion);
    console.log('Created Question:', createdQuestion);

    // Retrieve and list all interviews associated with your account
    const allQuestions = await getQuestions();
    console.log('All Questions:', allQuestions);

    // If there are interviews, retrieve the first one by its ID
    if (allQuestions.length > 0) {
      const singleQuestion = await getQuestion(allQuestions[0].id);
      console.log('Single Question:', singleQuestion);
    }

    // Create a new applicant with specific details
    const newApplicant = {
      interview_id:'129', 
      title: 'Mr',
      firstname: 'Ayooluwa',
      surname: 'Fadeyibi',
      phone_number: '00222999',
      email_address: 'fadeyibi122@uq.com',
      interview_status: 'Not Started'
    };
    const createdApplicant = await createApplicant(newApplicant);
    console.log('Created Applicant:', createdApplicant);

    // Retrieve and list all interviews associated with your account
    const allApplicants = await getApplicants();
    console.log('All Applicants:', allApplicants);

    // If there are interviews, retrieve the first one by its ID
    if (allQuestions.length > 0) {
      const singleApplicant = await getApplicant(allApplicants[0].id);
      console.log('Single Question:', singleApplicant);
    }

  } catch (error) {
    console.error('Error:', error.message); // Log any errors that occur
  }
}

//main();