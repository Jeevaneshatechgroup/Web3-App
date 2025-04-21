import os
from document_contract import approval_program, clear_state_program
from pyteal import compileTeal, Mode

def main():
    output_dir = "teal"
    os.makedirs(output_dir, exist_ok=True)
    
    approval_file = os.path.join(output_dir, "document_approval.teal")
    with open(approval_file, "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=5)
        f.write(compiled)
    print(f"Approval program compiled to {approval_file}")
    
    clear_file = os.path.join(output_dir, "document_clear_state.teal")
    with open(clear_file, "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=5)
        f.write(compiled)
    print(f"Clear state program compiled to {clear_file}")

if __name__ == "__main__":
    main()