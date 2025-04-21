import json
import os
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk import transaction
from algosdk.transaction import StateSchema

def deploy_smart_contract(client, creator_private_key):
    """
    Deploy the document management smart contract to Algorand testnet
    
    Args:
        client: Algorand client instance
        creator_private_key: Private key of the account deploying the contract
        
    Returns:
        The ID of the deployed application
    """
    try:
        with open("teal/document_approval.teal", "r") as f:
            approval_program = f.read()
        
        with open("teal/document_clear_state.teal", "r") as f:
            clear_program = f.read()
    except FileNotFoundError:
        print("TEAL files not found. Make sure to run compile_contract.py first.")
        return None
    
    try:
        approval_result = client.compile(approval_program)
        approval_binary = base64.b64decode(approval_result["result"])
        
        clear_result = client.compile(clear_program)
        clear_binary = base64.b64decode(clear_result["result"])
    except Exception as e:
        print(f"Error compiling TEAL programs: {e}")
        return None
    
    creator_address = account.address_from_private_key(creator_private_key)
    print(f"Deploying contract from account: {creator_address}")
    
    params = client.suggested_params()
    
    global_schema = StateSchema(num_uints=10, num_byte_slices=50)
    local_schema = StateSchema(num_uints=0, num_byte_slices=0)
    try:
        txn = transaction.ApplicationCreateTxn(
            sender=creator_address,
            sp=params,
            on_complete=transaction.OnComplete.NoOpOC,
            approval_program=approval_binary,
            clear_program=clear_binary,
            global_schema=global_schema,
            local_schema=local_schema
        )
        
        signed_txn = txn.sign(creator_private_key)
        
        txid = client.send_transaction(signed_txn)
        print(f"Transaction ID: {txid}")
        
        result = transaction.wait_for_confirmation(client, txid, 5)
        app_id = result["application-index"]
        print(f"Contract deployed successfully with app ID: {app_id}")
        
        with open("app_id.txt", "w") as f:
            f.write(str(app_id))
        
        return app_id
    
    except Exception as e:
        print(f"Error deploying contract: {e}")
        return None

def main():
    algod_address = os.getenv("ALGORAND_ALGOD_SERVER", "https://testnet-api.algonode.cloud")
    algod_token = os.getenv("ALGORAND_ALGOD_TOKEN", "")
    
    headers = {"X-API-Key": algod_token} if algod_token else {}
    client = algod.AlgodClient(algod_token, algod_address, headers)
    
    try:
        creator_mnemonic = input("Enter the mnemonic phrase for the deployer account: ")
        creator_private_key = mnemonic.to_private_key(creator_mnemonic)
        
        app_id = deploy_smart_contract(client, creator_private_key)
        if app_id:
            print(f"Document contract deployed with app ID: {app_id}")
            with open("../client/src/constants/contract.js", "w") as f:
                f.write(f"export const DOCUMENT_APP_ID = {app_id};\n")
        else:
            print("Failed to deploy contract")
    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import base64
    main()