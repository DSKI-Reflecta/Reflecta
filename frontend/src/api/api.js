import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE_URL = "http://localhost:8000";

const getAuthHeaders = async () => {
  const headers = { "Content-Type": "application/json" };
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    // Not authenticated
  }
  return headers;
};

const authFetch = async (url, options = {}) => {
  const headers = { ...(await getAuthHeaders()), ...options.headers };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    window.location.reload();
  }
  return response;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status} - ${
          errorData.detail || JSON.stringify(errorData)
        }`
      );
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
  }
  return response.json();
};

export const fetchCalendarData = async () => {
  const [entriesResponse, goalsResponse] = await Promise.all([
    authFetch(`${API_BASE_URL}/journal/entries/`),
    authFetch(`${API_BASE_URL}/goals/`),
  ]);

  const entriesData = await handleResponse(entriesResponse);
  const goalsData = await handleResponse(goalsResponse);

  return {
    journalEntries: entriesData,
    goals: goalsData,
  };
};

const calendarUpdateListeners = [];

export const addCalendarUpdateListener = (listener) => {
  calendarUpdateListeners.push(listener);
};

export const removeCalendarUpdateListener = (listener) => {
  const index = calendarUpdateListeners.indexOf(listener);
  if (index !== -1) {
    calendarUpdateListeners.splice(index, 1);
  }
};

const notifyCalendarUpdate = () => {
  calendarUpdateListeners.forEach((listener) => listener());
};

export const fetchJournalEntries = async () => {
  const response = await authFetch(`${API_BASE_URL}/journal/entries/`);
  const data = await handleResponse(response);
  const sortedEntries = data.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  return sortedEntries;
};

export const createJournalEntry = async (entryData) => {
  const response = await authFetch(`${API_BASE_URL}/journal/entries/`, {
    method: "POST",
    body: JSON.stringify(entryData),
  });
  const result = await handleResponse(response);
  notifyCalendarUpdate();
  return result;
};

export const updateJournalEntry = async (entryId, entryData) => {
  const response = await authFetch(`${API_BASE_URL}/journal/entries/${entryId}`, {
    method: "PUT",
    body: JSON.stringify(entryData),
  });
  const result = await handleResponse(response);
  notifyCalendarUpdate();
  return result;
};

export const deleteJournalEntry = async (entryId) => {
  const response = await authFetch(`${API_BASE_URL}/journal/entries/${entryId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status} - ${
          errorData.detail || JSON.stringify(errorData)
        }`
      );
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
  }
  notifyCalendarUpdate();
  return true;
};

export const fetchGoals = async () => {
  const response = await authFetch(`${API_BASE_URL}/goals/`);
  return handleResponse(response);
};

export const getAnalyticsSummary = async (period) => {
  const response = await authFetch(
    `${API_BASE_URL}/analytics/summary/?period=${period}`
  );
  return handleResponse(response);
};

export const getAnalyticsTrends = async (period) => {
  const response = await authFetch(
    `${API_BASE_URL}/analytics/trends/?period=${period}`
  );
  return handleResponse(response);
};

export const getAnalyticsCorrelations = async (period) => {
  const response = await authFetch(
    `${API_BASE_URL}/analytics/correlations/?period=${period}`
  );
  return handleResponse(response);
};

export const getAnalyticsStats = async (period) => {
  const response = await authFetch(
    `${API_BASE_URL}/analytics/stats/?period=${period}`
  );
  return handleResponse(response);
};

export const enhanceGoalDescription = async (title, description) => {
  const response = await authFetch(`${API_BASE_URL}/goals/enhance-description`, {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
  return handleResponse(response);
};

export const createGoal = async (goalData) => {
  const response = await authFetch(`${API_BASE_URL}/goals/`, {
    method: "POST",
    body: JSON.stringify(goalData),
  });
  const result = await handleResponse(response);
  notifyCalendarUpdate();
  return result;
};

export const updateGoal = async (goalId, goalData) => {
  const response = await authFetch(`${API_BASE_URL}/goals/${goalId}`, {
    method: "PUT",
    body: JSON.stringify(goalData),
  });
  const result = await handleResponse(response);
  notifyCalendarUpdate();
  return result;
};

export const deleteGoal = async (goalId) => {
  const response = await authFetch(`${API_BASE_URL}/goals/${goalId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status} - ${
          errorData.detail || JSON.stringify(errorData)
        }`
      );
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
  }
  notifyCalendarUpdate();
  return true;
};

export const sendChatMessage = async (message) => {
  const response = await authFetch(`${API_BASE_URL}/ai/chat/`, {
    method: "POST",
    body: JSON.stringify({ message: message }),
  });
  const data = await handleResponse(response);
  return data.text;
};

export const getJournalQuestion = async (content) => {
  const response = await authFetch(`${API_BASE_URL}/ai/journal-question/`, {
    method: "POST",
    body: JSON.stringify({ content: content }),
  });
  const data = await handleResponse(response);
  return data.question;
};

export const recommendGoals = async () => {
  const response = await authFetch(`${API_BASE_URL}/goals/recommend`, {
    method: "POST",
  });
  return handleResponse(response);
};

export const getAdminStats = async () => {
  const response = await authFetch(`${API_BASE_URL}/admin/stats`);
  return handleResponse(response);
};
