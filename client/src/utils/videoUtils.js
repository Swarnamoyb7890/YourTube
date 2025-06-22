export const getVideoUrl = (filepath) => {
    if (!filepath) return '';

    // Use production server URL
    const baseUrl = 'https://yourtube-atxv.onrender.com';

    // Remove any leading slashes and ensure the path starts with /uploads/
    const normalizedPath = filepath.replace(/^\/+/, '');
    return `${baseUrl}/${normalizedPath}`;
}; 