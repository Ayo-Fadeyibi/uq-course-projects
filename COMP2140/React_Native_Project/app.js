// Base URL for the Books Form RESTful API
const API_BASE_URL = "https://comp2140a3.uqcloud.net/api";

// JWT token for authorization, replace with your actual token from My Grades in Blackboard
// From the A2 JSON Web Token column, view Feedback to show your JWT
// The JWT for A3 is the same as A2
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4ODQ1ODkifQ.Ak4QrzWC7QWyZ8zWZYDWJLVvmihYx1vXe8Pcjr8pibA";

// Your UQ student username, used for row-level security to retrieve your records
const USERNAME = "s4884589";


/**
 * Helper function to handle API requests.
 * It sets the Authorization token and optionally includes the request body.
 * 
 * @param {string} endpoint - The API endpoint to call (e.g., "/form", "/field").
 * @param {string} [method='GET'] - The HTTP method to use (GET, POST, PATCH).
 * @param {object|null} [body=null] - The request body to send, typically for POST or PATCH.
 * @returns {Promise<object>} - The JSON response from the API.
 * @throws Will throw an error if the HTTP response is not OK.
 */
export async function apiRequest(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JWT_TOKEN}`, // Include the JWT token for authentication
    },
  };

  // If the method is POST or PATCH, we want the response to include the full representation
  if (method === "POST" || method === "PATCH") {
    options.headers["Prefer"] = "return=representation";
  }

  // If a body is provided, add it to the request and include the username
  if (body) {
    options.body = JSON.stringify({ ...body, username: USERNAME });
  }

  // Make the API request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} – ${errText}`);
  }

  // For DELETE requests, the response is typically empty
  if (method === "DELETE") {
    return null;
  }

  // Return the response as JSON
  return response.json();
}

/**
 * Function to create a new forms.
 * 
 * @returns {Promise<object>} - The created form object.
 */
export async function createNewForm(name, description) {
  return apiRequest("/form", "POST", { name, description });
}

export async function updateForm(formId, updates) {
  return apiRequest(`/form?id=eq.${formId}`, "PATCH", updates);
}

/**
 * Function to insert a single field for the form.
 * Call this function once for each field you want to add.
 * 
 * @param {number} formId - The ID of the form to attach this field to.
 * @param {object} field - The field definition object.
 * @returns {Promise<object>} - The created field object.
 */
export async function insertField(formId, field) {
  return apiRequest("/field", "POST", {
    ...field,
    form_id: formId,
  });
}

/**
 * Function to insert a single record (book entry) into the form.
 * 
 * @param {number} formId - The ID of the form to attach this record to.
 * @param {object} record - The record data (with a "values" object).
 * @returns {Promise<object>} - The created record object.
 */
export async function insertRecord(formId, record) {
  return apiRequest("/record", "POST", {
    ...record,
    form_id: formId,
  });
}

/**
 * Function to filter records by JSONB fields.
 * Example: category contains "JavaScript" AND price > 50.
 * 
 * @param {number} formId - The ID of the form whose records you want to filter.
 * @returns {Promise<Array>} - An array of matching record objects.
 */
export async function filterRecords(formId) {
  // Encoded query string (values->>'category' ILIKE '%JavaScript%' AND values->'price' < 50)
  // Note url encoding of > and placing quotes around keys
  // Note ->> for strings and -> for numbers
  const query =
    `/record?form_id=eq.${formId}` +
    `&values-%3E%3E%22category%22=ilike.*JavaScript*` +
    `&values-%3E%22price%22=lt.50`;

  return apiRequest(query);
}

/**
 * Function to delete a form by ID.
 * 
 * @param {number} formId - The ID of the form to delete.
 * @returns {Promise<void>} - Returns nothing on successful deletion.
 */
export async function deleteForm(formId) {
  return apiRequest(`/form?id=eq.${formId}`, "DELETE");
}

/**
 * Function to delete a record by ID.
 * 
 * @param {number} recordId - The ID of the record to delete.
 * @returns {Promise<void>} - Returns nothing on successful deletion.
 */
export async function deleteRecord(recordId) {
  return apiRequest(`/record?id=eq.${recordId}`, "DELETE");
}

