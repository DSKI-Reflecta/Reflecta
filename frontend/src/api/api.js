const API_BASE_URL = "http://localhost:8000";

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
    fetch(`${API_BASE_URL}/journal/entries/`),
    fetch(`${API_BASE_URL}/goals/`),
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
  const response = await fetch(`${API_BASE_URL}/journal/entries/`);
  const data = await handleResponse(response);
  const sortedEntries = data.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  return sortedEntries;
};

export const createJournalEntry = async (entryData) => {
  const response = await fetch(`${API_BASE_URL}/journal/entries/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entryData),
  });
  const result = await handleResponse(response);
  notifyCalendarUpdate();
  return result;
};

export const updateJournalEntry = async (entryId, entryData) => {
  const response = await fetch(`${API_BASE_URL}/journal/entries/${entryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entryData),
  });
  const result = await handleResponse(response);
  notifyCalendarUpdate();
  return result;
};

export const deleteJournalEntry = async (entryId) => {
  const response = await fetch(`${API_BASE_URL}/journal/entries/${entryId}`, {
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
  const response = await fetch(`${API_BASE_URL}/goals/`);
  return handleResponse(response);
};

export const createGoal = async (goalData) => {
  const response = await fetch(`${API_BASE_URL}/goals/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goalData),
  });
  const result = await handleResponse(response);
  notifyCalendarUpdate();
  return result;
};

export const updateGoal = async (goalId, goalData) => {
  const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goalData),
  });
  const result = await handleResponse(response);
  notifyCalendarUpdate();
  return result;
};

export const deleteGoal = async (goalId) => {
  const response = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
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
  const response = await fetch(`${API_BASE_URL}/ai/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message }),
  });
  const data = await handleResponse(response);
  return data.response;
};
