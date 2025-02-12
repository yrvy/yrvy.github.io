const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://yrvy.github.io/api';

export const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(id);
    console.error('Fetch error:', error);
    throw error;
  }
};

// Helper function to replace fetch calls
export const replaceAllFetchCalls = (fileContent) => {
  // Replace fetch calls with fetchWithTimeout
  return fileContent.replace(
    /fetch\((['"`])http:\/\/localhost:3002(.*?)\1,?\s*({[\s\S]*?})?/g, 
    (match, quote, path, options) => {
      const cleanPath = path.trim();
      const cleanOptions = options ? options.trim() : '{}';
      return `fetchWithTimeout('${API_BASE_URL}${cleanPath}', ${cleanOptions})`;
    }
  );
};