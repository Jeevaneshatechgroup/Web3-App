import algosdk from "algosdk";
import { 
  ALGORAND_ALGOD_SERVER, 
  ALGORAND_ALGOD_PORT, 
  ALGORAND_ALGOD_TOKEN,
  ALGORAND_INDEXER_SERVER,
  ALGORAND_INDEXER_PORT,
  ALGORAND_INDEXER_TOKEN
} from "@/constants";

export const algodClient = new algosdk.Algodv2(
  ALGORAND_ALGOD_TOKEN, 
  ALGORAND_ALGOD_SERVER, 
  ALGORAND_ALGOD_PORT
);

export const indexerClient = new algosdk.Indexer(
  ALGORAND_INDEXER_TOKEN, 
  ALGORAND_INDEXER_SERVER, 
  ALGORAND_INDEXER_PORT
);

export async function getTransactionParams() {
  return await algodClient.getTransactionParams().do();
}

export async function waitForConfirmation(txId: string) {
  const status = await algodClient.status().do();
  let lastRound = status["last-round"];
  
  while (true) {
    const pendingInfo = await algodClient
      .pendingTransactionInformation(txId)
      .do();
    
    if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
      return pendingInfo;
    }
    
    lastRound++;
    await algodClient.statusAfterBlock(lastRound).do();
  }
}

export async function signAndSendTransaction(transaction: algosdk.Transaction, wallet: any) {
  try {
    const signedTxn = await wallet.signTransaction([transaction]);
    
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    
    const confirmedTxn = await waitForConfirmation(txId);
    return {
      txId,
      confirmedTxn
    };
  } catch (error) {
    console.error("Error in signAndSendTransaction:", error);
    throw error;
  }
}

export async function createNFTAsset(
  wallet: any,
  name: string,
  fileName: string,
  cid: string,
  didIdentifier: string
) {
  try {
    const address = wallet.getAddress();
    const params = await getTransactionParams();
    
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: address,
      total: 1, 
      decimals: 0, 
      defaultFrozen: false,
      manager: address,
      reserve: address,
      freeze: address,
      clawback: address,
      suggestedParams: params,
      assetName: `DocNFT-${name}`,
      unitName: "DOCNFT",
      assetURL: `ipfs://${cid}`,
      note: algosdk.encodeObj({
        type: "document",
        name: fileName,
        cid: cid,
        did: didIdentifier,
        created: new Date().toISOString()
      }),
    });
    
    const { txId, confirmedTxn } = await signAndSendTransaction(txn, wallet);
    
    const assetId = confirmedTxn["asset-index"];
    
    return {
      txId,
      assetId
    };
  } catch (error) {
    console.error("Error creating NFT asset:", error);
    throw error;
  }
}

export async function uploadDocumentMetadata(
  wallet: any,
  docName: string,
  cid: string,
  didIdentifier: string,
  fileSize: number,
  fileType: string
) {
  try {
    const address = wallet.getAddress();
    const params = await getTransactionParams();
    
    const note = algosdk.encodeObj({
      type: "document",
      name: docName,
      cid: cid,
      did: didIdentifier,
      size: fileSize,
      fileType: fileType,
      timestamp: new Date().toISOString()
    });
    
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: address,
      to: address, 
      amount: 0, 
      note: note,
      suggestedParams: params
    });
    
    const { txId } = await signAndSendTransaction(txn, wallet);
    
    return {
      txId
    };
  } catch (error) {
    console.error("Error uploading document metadata:", error);
    throw error;
  }
}

export async function shareDocument(
  wallet: any,
  docId: string,
  recipientAddress: string,
  cid: string,
  permissionLevel: string
) {
  try {
    const address = wallet.getAddress();
    const params = await getTransactionParams();
    
    const note = algosdk.encodeObj({
      type: "documentShare",
      docId: docId,
      cid: cid,
      permission: permissionLevel,
      timestamp: new Date().toISOString()
    });
    
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: address,
      to: recipientAddress, 
      amount: 0, 
      note: note,
      suggestedParams: params
    });
    
    
    const { txId } = await signAndSendTransaction(txn, wallet);
    
    return {
      txId
    };
  } catch (error) {
    console.error("Error sharing document:", error);
    throw error;
  }
}


export async function getDidMapping(walletAddress: string) {
  try {
    const transactions = await indexerClient
      .searchForTransactions()
      .address(walletAddress)
      .notePrefix(new Uint8Array(Buffer.from("didMapping:")))
      .do();
    
    if (transactions && transactions.transactions && transactions.transactions.length > 0) {
      const sortedTxns = transactions.transactions.sort((a: any, b: any) => 
        b["confirmed-round"] - a["confirmed-round"]
      );
      
      const latestTxn = sortedTxns[0];
      
      if (latestTxn.note) {
        const noteStr = Buffer.from(latestTxn.note, 'base64').toString();
        if (noteStr.startsWith("didMapping:")) {
          return noteStr.slice(11); 
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting DID mapping:", error);
    throw error;
  }
}

export async function storeDidMapping(wallet: any, didIdentifier: string) {
  try {
    const address = wallet.getAddress();
    const params = await getTransactionParams();
    
    const note = Buffer.from(`didMapping:${didIdentifier}`);
    
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: address,
      to: address,
      amount: 0, 
      note: note,
      suggestedParams: params
    });
    
    const { txId } = await signAndSendTransaction(txn, wallet);
    
    return {
      txId,
      didIdentifier
    };
  } catch (error) {
    console.error("Error storing DID mapping:", error);
    throw error;
  }
}

export async function getUserDocuments(walletAddress: string) {
  try {
    const transactions = await indexerClient
      .searchForTransactions()
      .address(walletAddress)
      .do();
    
    const documents: any[] = [];
    
    if (transactions && transactions.transactions) {
      for (const txn of transactions.transactions) {
        if (txn.note) {
          try {
            const decodedNote = algosdk.decodeObj(txn.note);
            
            if (decodedNote && decodedNote.type === "document") {
              documents.push({
                id: txn.id,
                txId: txn.id,
                name: decodedNote.name,
                cid: decodedNote.cid,
                did: decodedNote.did,
                size: decodedNote.size || 0,
                type: decodedNote.fileType || 'application/octet-stream',
                created: new Date(decodedNote.timestamp),
                walletAddress: txn.sender
              });
            }
          } catch (error) {
            continue;
          }
        }
      }
    }
    
    return documents;
  } catch (error) {
    console.error("Error getting user documents:", error);
    throw error;
  }
}

export async function getUserNFTs(walletAddress: string) {
  try {
    const assets = await indexerClient
      .lookupAccountAssets(walletAddress)
      .do();
    
    const nfts: any[] = [];
    
    if (assets && assets.assets) {
      for (const asset of assets.assets) {
        if (asset.amount === 1) {
          try {
            const assetInfo = await indexerClient
              .lookupAssetByID(asset["asset-id"])
              .do();
            
            if (assetInfo && assetInfo.asset) {
              const params = assetInfo.asset.params;
              
              if (params["name"] && params["name"].startsWith("DocNFT-")) {
                const txns = await indexerClient
                  .lookupAssetTransactions(asset["asset-id"])
                  .do();
                
                if (txns && txns.transactions && txns.transactions.length > 0) {
                  const createTxn = txns.transactions[0];
                  
                  if (createTxn.note) {
                    const decodedNote = algosdk.decodeObj(createTxn.note);
                    
                    nfts.push({
                      assetId: asset["asset-id"],
                      name: decodedNote.name || params["name"].replace("DocNFT-", ""),
                      cid: decodedNote.cid || params["url"].replace("ipfs://", ""),
                      did: decodedNote.did || "",
                      type: decodedNote.type || "application/octet-stream",
                      created: decodedNote.created ? new Date(decodedNote.created) : new Date(createTxn["round-time"] * 1000),
                      walletAddress: createTxn.sender
                    });
                  }
                }
              }
            }
          } catch (error) {
            continue;
          }
        }
      }
    }
    
    return nfts;
  } catch (error) {
    console.error("Error getting user NFTs:", error);
    throw error;
  }
}

export async function getSharedDocuments(walletAddress: string) {
  try {
    const transactions = await indexerClient
      .searchForTransactions()
      .addressRole("receiver")
      .address(walletAddress)
      .do();
    
    const sharedDocuments: any[] = [];
    
    if (transactions && transactions.transactions) {
      for (const txn of transactions.transactions) {
        if (txn.note) {
          try {
            const decodedNote = algosdk.decodeObj(txn.note);
            
            if (decodedNote && decodedNote.type === "documentShare") {
              const docTxns = await indexerClient
                .searchForTransactions()
                .txid(decodedNote.docId)
                .do();
              
              if (docTxns && docTxns.transactions && docTxns.transactions.length > 0) {
                const docTxn = docTxns.transactions[0];
                const docMetadata = algosdk.decodeObj(docTxn.note);
                
                sharedDocuments.push({
                  id: txn.id,
                  name: docMetadata.name,
                  cid: decodedNote.cid,
                  size: docMetadata.size || 0,
                  type: docMetadata.fileType || 'application/octet-stream',
                  created: new Date(docMetadata.timestamp),
                  walletAddress: txn.sender,
                  permission: decodedNote.permission,
                  sharedAt: new Date(decodedNote.timestamp)
                });
              } else {
                sharedDocuments.push({
                  id: txn.id,
                  name: "Shared Document",
                  cid: decodedNote.cid,
                  size: 0,
                  type: 'application/octet-stream',
                  created: new Date(decodedNote.timestamp),
                  walletAddress: txn.sender,
                  permission: decodedNote.permission,
                  sharedAt: new Date(decodedNote.timestamp)
                });
              }
            }
          } catch (error) {
            continue;
          }
        }
      }
    }
    
    return sharedDocuments;
  } catch (error) {
    console.error("Error getting shared documents:", error);
    throw error;
  }
}
