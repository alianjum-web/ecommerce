export const validateFile = (file) => {
    const allowedTypes = ['image/jpeg','image/png','image/gif','image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    // check file type
    if (!allowedTypes.includes(file.mimetype)) {
        return 'Invalid file type.Only JPEG, PNG, WEBP and GIF are allowed.';
    }

    //check file size
    if (file.size > maxSize) {
        return 'File size exceeds the maximum limit of 2MB';
    }

    return null;  // No error
}