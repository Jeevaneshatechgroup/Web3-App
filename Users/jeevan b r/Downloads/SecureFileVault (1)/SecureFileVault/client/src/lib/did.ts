/**
 * This file implements a simplified Decentralized Identifier (DID) system
 * built specifically for integration with the Exodus wallet
 * 
 * In a production environment, you would use a standard DID method like did:key, did:ethr, or did:web
 * and integrate with a full DID resolver system
 */

import { ethers } from 'ethers';

export interface DecentralizedID {
  did: string;
  didDocument: any;
  controller: string;
  verificationMethod: string[];
  created: string;
  updated: string;
}

/**
 * Creates a Decentralized Identifier (DID) from a wallet address
 * This is a simple implementation for demo purposes
 * In a production environment, you would use a formal DID method like did:ethr or did:web
 * 
 * @param walletAddress Ethereum wallet address
 * @returns DID object with the generated DID and associated document
 */
export function createDID(walletAddress: string): DecentralizedID {
  // Create a DID in the format "did:exodus:{wallet address}"
  const did = `did:exodus:${walletAddress.toLowerCase()}`;
  
  // Current timestamp
  const timestamp = new Date().toISOString();
  
  // Create a simple DID document
  // In a real-world scenario, this would follow the W3C DID Document specification
  const verificationMethod = [
    `${did}#keys-1`,  // Authentication key
    `${did}#keys-2`   // Assertion key
  ];
  
  const didDocument = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: did,
    controller: walletAddress,
    verificationMethod: [
      {
        id: `${did}#keys-1`,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: did,
        blockchainAccountId: `eip155:1:${walletAddress}`
      },
      {
        id: `${did}#keys-2`,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: did,
        publicKeyHex: walletAddress.slice(2)  // Strip '0x' prefix
      }
    ],
    authentication: [
      `${did}#keys-1`
    ],
    assertionMethod: [
      `${did}#keys-2`
    ]
  };
  
  return {
    did,
    didDocument,
    controller: walletAddress,
    verificationMethod,
    created: timestamp,
    updated: timestamp
  };
}

/**
 * Verify a DID signature
 * @param did The DID that signed the message
 * @param message Original message that was signed
 * @param signature The signature to verify
 * @returns Boolean indicating if the signature is valid
 */
export async function verifyDIDSignature(
  did: DecentralizedID, 
  message: string, 
  signature: string
): Promise<boolean> {
  try {
    // Extract wallet address from DID
    const walletAddress = did.controller;
    
    // Verify the signature using ethers
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // Check if the recovered address matches the DID controller
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error("Error verifying DID signature:", error);
    return false;
  }
}

/**
 * Generate a verifiable credential using a DID
 * This is a simplified implementation
 */
export function createVerifiableCredential(
  issuerDid: DecentralizedID,
  subjectDid: DecentralizedID,
  claims: Record<string, any>
) {
  const issuanceDate = new Date().toISOString();
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1); // Valid for 1 year
  
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1'
    ],
    type: ['VerifiableCredential'],
    issuer: issuerDid.did,
    issuanceDate,
    expirationDate: expirationDate.toISOString(),
    credentialSubject: {
      id: subjectDid.did,
      ...claims
    }
  };
}