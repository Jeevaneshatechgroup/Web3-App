from pyteal import *
 
def approval_program():


    upload_document = Bytes("uploadDocument")
    share_document = Bytes("shareDocument")
    mint_nft = Bytes("mintNFT")
 

    handle_creation = Seq([
        Return(Int(1))
    ])
 

    document_cid = Txn.application_args[1]
    document_name = Txn.application_args[2]
   
    handle_upload = Seq([

        Assert(Global.group_size() == Int(1)),
       
        App.globalPut(Concat(Bytes("doc_"), document_cid), Txn.sender()),
       
        App.globalPut(Concat(Bytes("meta_"), document_cid), document_name),
       
        Return(Int(1))
    ])
 
    recipient_address = Txn.application_args[2]
   
    handle_share = Seq([
        Assert(Global.group_size() == Int(1)),
       
        Assert(App.globalGet(Concat(Bytes("doc_"), document_cid)) == Txn.sender()),
       
        App.globalPut(
            Concat(
                Concat(
                    Concat(Bytes("shared_"), document_cid),
                    Bytes("_")
                ),
                recipient_address
            ),
            Int(1)
        ),
       
        Return(Int(1))
    ])
 
    handle_mint = Seq([
        Assert(Global.group_size() == Int(1)),
       
        Assert(App.globalGet(Concat(Bytes("doc_"), document_cid)) == Txn.sender()),
       
        App.globalPut(Concat(Bytes("nft_"), document_cid), Int(1)),
       
        Return(Int(1))
    ])
 
    handle_optin = Return(Int(1))
 
    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.application_args[0] == upload_document, handle_upload],
        [Txn.application_args[0] == share_document, handle_share],
        [Txn.application_args[0] == mint_nft, handle_mint]
    )
 
    return program
 
def clear_state_program():
    return Return(Int(1))
 
if __name__ == "__main__":
    with open("document_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=5)
        f.write(compiled)
 
    with open("document_clear_state.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=5)
        f.write(compiled)