// IPFS utility functions

/**
 * Returns the IPFS gateway URL for a given CID
 * 
 * @param cid The IPFS Content Identifier
 * @param gatewayUrl The IPFS gateway URL to use (defaults to Pinata gateway)
 * @returns Full URL to access the content
 */
export function getIpfsUrl(cid: string, gatewayUrl = 'https://gateway.pinata.cloud/ipfs/'): string {
  if (!cid) return '';
  
  // Make sure the gateway URL ends with a slash
  const formattedGateway = gatewayUrl.endsWith('/') ? gatewayUrl : `${gatewayUrl}/`;
  
  // Remove any 'ipfs://' prefix from the CID
  const formattedCid = cid.replace('ipfs://', '');
  
  return `${formattedGateway}${formattedCid}`;
}

/**
 * Downloads a file from IPFS
 * 
 * @param cid The IPFS Content Identifier
 * @param filename The name to save the file as
 * @param gatewayUrl The IPFS gateway URL to use
 */
export async function downloadFromIpfs(
  cid: string,
  filename: string,
  gatewayUrl = 'https://gateway.pinata.cloud/ipfs/'
): Promise<void> {
  if (!cid || !filename) {
    throw new Error('CID and filename are required');
  }
  
  try {
    const url = getIpfsUrl(cid, gatewayUrl);
    
    // Fetch the file
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    // Get the blob
    const blob = await response.blob();
    
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    
    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error downloading file from IPFS:', error);
    throw error;
  }
}

/**
 * Copies text to clipboard
 * 
 * @param text Text to copy
 * @returns Promise that resolves when the text is copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
}
