#!/usr/bin/env python3

import base64
import os
import algosdk
from algosdk.v2client import algod
from algosdk import transaction
from algosdk.transaction import ApplicationCreateTxn, wait_for_confirmation
from pyteal import compileTeal, Mode
from document_storage_contract import approval_program, clear_state_program

def deploy_document_storage_contract(client, creator_private_key):
    """
    Deploy the document storage smart contract to Algorand
    
    Args:
        client: Algorand client instance
        creator_private_key: Private key of the account deploying the contract
        
    Returns:
        The ID of the deployed application
    """
    creator_account = algosdk.account.address_from_private_key(creator_private_key)
    
    approval_program_teal = compileTeal(approval_program(), Mode.Application, version=5)
    clear_state_program_teal = compileTeal(clear_state_program(), Mode.Application, version=5)
    
    approval_program_compiled = compile_program(client, approval_program_teal)
    clear_state_program_compiled = compile_program(client, clear_state_program_teal)
    
    params = client.suggested_params()
    
    global_schema = transaction.StateSchema(num_uints=0, num_byte_slices=60)
    local_schema = transaction.StateSchema(num_uints=0, num_byte_slices=0)
    
    app_txn = ApplicationCreateTxn(
        sender=creator_account,
        sp=params,
        on_complete=transaction.OnComplete.NoOpOC,
        approval_program=approval_program_compiled,
        clear_program=clear_state_program_compiled,
        global_schema=global_schema,
        local_schema=local_schema
    )
    
    signed_txn = app_txn.sign(creator_private_key)
    
    tx_id = client.send_transaction(signed_txn)
    print(f"Deployed Document Storage Smart Contract with transaction ID: {tx_id}")
    
    confirmed_txn = wait_for_confirmation(client, tx_id, 10)
    
    app_id = confirmed_txn["application-index"]
    print(f"Document Storage Smart Contract created with App ID: {app_id}")
    
    return app_id

def compile_program(client, source_code):
    """Compile a TEAL program"""
    compile_response = client.compile(source_code)
    return base64.b64decode(compile_response["result"])

def main():
    """
    Deploy the document storage smart contract
    """
    algod_address = os.environ.get("ALGORAND_ALGOD_SERVER", "https://testnet-api.algonode.cloud")
    algod_token = os.environ.get("ALGORAND_ALGOD_TOKEN", "")
    client = algod.AlgodClient(algod_token, algod_address)
    
    deployer_private_key = "ic1ztaq/SO9QOI5k8EefJ9ZFSaoASdQ5itDR+RITFYDhZONa278TuOQI+U2JeGY4HeVY10ebk79tCG43CTtKCA=="
    if not deployer_private_key:
        print("ERROR: ALGORAND_DEPLOYER_PRIVATE_KEY environment variable is not set")
        print("Please set this variable with your Algorand account private key to deploy the contract")
        return
    
    app_id = deploy_document_storage_contract(client, deployer_private_key)
    
    print("\n=========================================================")
    print(f"Update your .env file with:")
    print(f"VITE_DOCUMENT_STORAGE_APP_ID={app_id}")
    print("=========================================================\n")
    
if __name__ == "__main__":
    main()