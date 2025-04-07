/**
 * Formats a blockchain address for display by shortening it
 * @param address The full blockchain address
 * @param startChars Number of characters to show at the start
 * @param endChars Number of characters to show at the end
 * @returns Shortened address string
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return '';
  
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Validates an Ethereum wallet address
 * @param address The address to validate
 * @returns Boolean indicating if the address is valid
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Formats file size in a human-readable way
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formats a date for display
 * @param date Date object or string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Get file type category based on MIME type
 * @param mimeType File MIME type
 * @returns Category string
 */
export function getFileCategory(mimeType: string): string {
  if (!mimeType) return 'Unknown';
  
  if (mimeType.startsWith('image/')) {
    return 'Images';
  } else if (mimeType.startsWith('video/')) {
    return 'Videos';
  } else if (mimeType.startsWith('audio/')) {
    return 'Audio';
  } else if (
    mimeType.includes('pdf') ||
    mimeType.includes('document') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation')
  ) {
    return 'Documents';
  } else if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar') ||
    mimeType.includes('gzip')
  ) {
    return 'Archives';
  } else {
    return 'Other';
  }
}

/**
 * Gets icon type based on file MIME type
 * @param mimeType File MIME type
 * @returns Icon type string for Lucide icons
 */
export function getFileIconType(mimeType: string): string {
  if (!mimeType) return 'File';
  
  if (mimeType.startsWith('image/')) {
    return 'Image';
  } else if (mimeType.startsWith('video/')) {
    return 'Video';
  } else if (mimeType.startsWith('audio/')) {
    return 'Music';
  } else if (mimeType.includes('pdf')) {
    return 'FileText';
  } else if (
    mimeType.includes('document') ||
    mimeType.includes('msword') ||
    mimeType.includes('wordprocessing')
  ) {
    return 'FileText';
  } else if (
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    mimeType.includes('spreadsheet')
  ) {
    return 'Table';
  } else if (
    mimeType.includes('presentation') ||
    mimeType.includes('powerpoint')
  ) {
    return 'Presentation';
  } else if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar') ||
    mimeType.includes('gzip')
  ) {
    return 'Archive';
  } else {
    return 'File';
  }
}
