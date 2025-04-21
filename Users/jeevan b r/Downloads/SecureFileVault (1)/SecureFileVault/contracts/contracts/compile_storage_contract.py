#!/usr/bin/env python3

import os
import importlib.util
from document_storage_contract import approval_program, clear_state_program
from pyteal import compileTeal, Mode

def main():
    """
    Script to compile the document storage smart contract
    Outputs TEAL files in the current directory
    """
    approval_teal = compileTeal(approval_program(), Mode.Application, version=5)
    with open("document_storage_approval.teal", "w") as f:
        f.write(approval_teal)
    print("Approval program compiled to document_storage_approval.teal")
    
    clear_teal = compileTeal(clear_state_program(), Mode.Application, version=5)
    with open("document_storage_clear.teal", "w") as f:
        f.write(clear_teal)
    print("Clear state program compiled to document_storage_clear.teal")
    
    print("Compilation complete!")

if __name__ == "__main__":
    main()