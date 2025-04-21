
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to a base64 string that can be stored
 * @param key The CryptoKey to export
 * @returns A base64 string representation of the key
 */
export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Import a base64 key string back to a CryptoKey object
 * @param keyBase64 The base64 string representation of the key
 * @returns A CryptoKey that can be used for encryption/decryption
 */
export async function importKeyFromBase64(keyBase64: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(keyBase64);
  return await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt content using the Web Crypto API
 * 
 * @param content The content to encrypt (usually base64-encoded file content)
 * @param key The CryptoKey to use for encryption
 * @returns An object containing the encrypted data and IV, both as base64 strings
 */
export async function encryptContent(
  content: string,
  key: CryptoKey
): Promise<{ encryptedContent: string, iv: string }> {
  const encoder = new TextEncoder();
  const contentBuffer = encoder.encode(content);
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    contentBuffer
  );
  
  return {
    encryptedContent: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv)
  };
}

/**
 * Decrypt content using the Web Crypto API
 * 
 * @param encryptedContent The encrypted content as a base64 string
 * @param iv The initialization vector as a base64 string
 * @param key The CryptoKey to use for decryption
 * @returns The decrypted content as a base64 string
 */
export async function decryptContent(
  encryptedContent: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const encryptedBuffer = base64ToArrayBuffer(encryptedContent);
  const ivBuffer = base64ToArrayBuffer(iv);
  
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(ivBuffer)
    },
    key,
    encryptedBuffer
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Helper function to convert an ArrayBuffer to a Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Helper function to convert a Base64 string to an ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a wallet-specific decryption key using the user's DID
 * This allows content to be encrypted for specific wallet addresses
 * 
 * @param walletAddress The wallet address to generate a shared key for
 * @param ownerDid The owner's DID for generating the shared key
 * @returns A base64 string representing a deterministic key for this wallet address
 */
export async function generateWalletSpecificKey(
  walletAddress: string,
  ownerDid: string
): Promise<string> {
  const encoder = new TextEncoder();
  const seedData = encoder.encode(`${ownerDid}-to-${walletAddress.toLowerCase()}`);
  
  const keyMaterial = await window.crypto.subtle.digest('SHA-256', seedData);
  
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  return exportKeyToBase64(key);
}

/**
 * Store a file encryption key in localStorage with proper error handling
 * @param fileId The ID of the file this key belongs to
 * @param key The encryption key in base64 format
 * @returns True if successful, false if failed
 */
export function storeFileEncryptionKey(fileId: number, key: string): boolean {
  try {
    const storageKey = `file_key_${fileId}`;
    localStorage.setItem(storageKey, key);
    return true;
  } catch (error) {
    console.error('Failed to store file encryption key:', error);
    return false;
  }
}

/**
 * Retrieve a file encryption key from localStorage
 * Checks both the new format (file_key_123) and legacy format directly using the ID
 * @param fileId The ID of the file to get the key for
 * @returns The encryption key as a base64 string or null if not found
 */
export function getFileEncryptionKey(fileId: number): string | null {
  try {
    const storageKey = `file_key_${fileId}`;
    let keyValue = localStorage.getItem(storageKey);
    
    if (!keyValue) {
      console.log('Trying legacy key format for file ID:', fileId);
      keyValue = localStorage.getItem(`${fileId}`);
      
      if (keyValue) {
        console.log('Found legacy key format, migrating to new format');
        localStorage.setItem(storageKey, keyValue);
      }
    }
    
    return keyValue;
  } catch (error) {
    console.error('Failed to retrieve file encryption key:', error);
    return null;
  }
}