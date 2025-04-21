from pyteal import *
 
 
def approval_program():
    """
    PyTeal contract for document storage on Algorand blockchain
    This contract handles:
    - Storing document CIDs, names, DIDs, and IPFS hashes in global state
    - Mapping documents to their owners
    """
    handle_creation = Seq([
        Return(Int(1))
    ])
 
    upload_document = Seq([
        Assert(Global.group_size() == Int(1)),
        Assert(Txn.application_args.length() == Int(5)),
 
        App.globalPut(
            Concat(Bytes("doc_"), Txn.application_args[1]),
            Txn.sender()
        ),
 
        App.globalPut(
            Concat(Bytes("meta_"), Txn.application_args[1]),
            Txn.application_args[2]
        ),
 
        App.globalPut(
            Concat(Bytes("did_"), Txn.application_args[1]),
            Txn.application_args[3]
        ),
 
        App.globalPut(
            Concat(Bytes("ipfs_"), Txn.application_args[1]),
            Txn.application_args[4]
        ),
 
        Return(Int(1))
    ])
 
    no_op = Return(Int(0))
 
    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, Return(Int(1))],
        [Txn.on_completion() == OnComplete.CloseOut, Return(Int(1))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Int(0))],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Int(0))],
        [Txn.application_args[0] == Bytes("uploadDocument"), upload_document],
        [Int(1), no_op]
    )
 
    return program
 
 
def clear_state_program():
    return Return(Int(1))
 
 
if __name__ == "__main__":
    with open("document_storage_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), Mode.Application, version=5)
        f.write(compiled)
 
    with open("document_storage_clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), Mode.Application, version=5)
        f.write(compiled)
 