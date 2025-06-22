export const getVideoUrl = (filepath) => {
    if (!filepath) return '';

    // Use local server URL when running locally
    const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000'
        : 'https://yourtube-atxv.onrender.com';

    // Remove any leading slashes and ensure the path starts with /uploads/
    const normalizedPath = filepath.replace(/^\/+/, '');
    return `${baseUrl}/${normalizedPath}`;
}; 