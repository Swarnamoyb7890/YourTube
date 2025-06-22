export const getVideoUrl = (filepath) => {
    if (!filepath) return '';

    // Use production server URL
    const baseUrl = 'https://yourtube-atxv.onrender.com';

    // Remove any leading slashes and ensure the path starts with /uploads/
    const normalizedPath = filepath.replace(/^\/+/, '');
    const fullUrl = `${baseUrl}/${normalizedPath}`;

    // Debug logging
    console.log('Video URL generated:', { filepath, normalizedPath, fullUrl });

    return fullUrl;
};

// Test function to verify video player works
export const getTestVideoUrl = () => {
    // Use a sample video that should work
    return 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
}; 