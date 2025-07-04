// Get base URL from environment or default to localhost for development
const getVideoBaseURL = () => {
    return process.env.REACT_APP_VIDEO_BASE_URL || 'https://yourtube-atxv.onrender.com';
};

export const getVideoUrl = (filepath) => {
    if (!filepath) {
        console.warn('No filepath provided for video URL');
        return '';
    }

    // Use local development server URL
    const baseUrl = getVideoBaseURL();

    // Clean up the filepath - remove any leading slashes and ensure proper format
    let normalizedPath = filepath.replace(/^\/+/, '');

    // If the path doesn't start with 'uploads/', add it
    if (!normalizedPath.startsWith('uploads/')) {
        normalizedPath = `uploads/${normalizedPath}`;
    }

    const fullUrl = `${baseUrl}/${normalizedPath}`;

    // Debug logging
    console.log('Video URL generated:', {
        originalFilepath: filepath,
        normalizedPath,
        fullUrl,
        baseUrl
    });

    return fullUrl;
};

// Test function to verify video player works
export const getTestVideoUrl = () => {
    // Use a sample video that should work
    return 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
}; 