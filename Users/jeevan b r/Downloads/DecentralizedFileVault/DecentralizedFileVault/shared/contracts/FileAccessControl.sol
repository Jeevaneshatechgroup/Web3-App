// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FileAccessControl
 * @dev Contract to manage access control for decentralized file sharing
 */
contract FileAccessControl {
    // File access permission levels
    enum Permission { VIEW, DOWNLOAD, FULL }
    
    // Structure to store file access information
    struct FileAccess {
        string ipfsCid;
        address owner;
        mapping(address => Permission) accessList;
        address[] authorizedUsers;
    }
    
    // Mapping from IPFS CID to FileAccess
    mapping(string => FileAccess) private files;
    
    // Mapping to track all files owned by an address
    mapping(address => string[]) private ownedFiles;
    
    // Events
    event FileRegistered(string ipfsCid, address owner);
    event AccessGranted(string ipfsCid, address user, Permission permission);
    event AccessRevoked(string ipfsCid, address user);
    event FileRemoved(string ipfsCid);
    
    /**
     * @dev Register a new file in the system
     * @param _ipfsCid IPFS CID of the file
     */
    function registerFile(string memory _ipfsCid) public {
        require(bytes(_ipfsCid).length > 0, "Invalid IPFS CID");
        require(files[_ipfsCid].owner == address(0), "File already registered");
        
        // Create new file access record
        FileAccess storage newFile = files[_ipfsCid];
        newFile.ipfsCid = _ipfsCid;
        newFile.owner = msg.sender;
        
        // Add to owner's files
        ownedFiles[msg.sender].push(_ipfsCid);
        
        emit FileRegistered(_ipfsCid, msg.sender);
    }
    
    /**
     * @dev Grant access to a file
     * @param _ipfsCid IPFS CID of the file
     * @param _user Address to grant access to
     * @param _permission Permission level to grant
     */
    function grantAccess(string memory _ipfsCid, address _user, Permission _permission) public {
        require(files[_ipfsCid].owner == msg.sender, "Only the owner can grant access");
        require(_user != address(0), "Invalid user address");
        
        FileAccess storage fileAccess = files[_ipfsCid];
        
        // If new user, add to the list
        if (fileAccess.accessList[_user] == Permission(0) && _user != fileAccess.owner) {
            fileAccess.authorizedUsers.push(_user);
        }
        
        // Set permission
        fileAccess.accessList[_user] = _permission;
        
        emit AccessGranted(_ipfsCid, _user, _permission);
    }
    
    /**
     * @dev Revoke access to a file
     * @param _ipfsCid IPFS CID of the file
     * @param _user Address to revoke access from
     */
    function revokeAccess(string memory _ipfsCid, address _user) public {
        require(files[_ipfsCid].owner == msg.sender, "Only the owner can revoke access");
        require(_user != address(0), "Invalid user address");
        
        FileAccess storage fileAccess = files[_ipfsCid];
        require(fileAccess.accessList[_user] != Permission(0), "User has no access");
        
        // Remove from access list
        delete fileAccess.accessList[_user];
        
        // Remove from authorized users
        for (uint i = 0; i < fileAccess.authorizedUsers.length; i++) {
            if (fileAccess.authorizedUsers[i] == _user) {
                // Swap with the last element and pop
                fileAccess.authorizedUsers[i] = fileAccess.authorizedUsers[fileAccess.authorizedUsers.length - 1];
                fileAccess.authorizedUsers.pop();
                break;
            }
        }
        
        emit AccessRevoked(_ipfsCid, _user);
    }
    
    /**
     * @dev Check if a user has access to a file
     * @param _ipfsCid IPFS CID of the file
     * @param _user Address to check access for
     * @return Permission level (0 for no access)
     */
    function checkAccess(string memory _ipfsCid, address _user) public view returns (Permission) {
        FileAccess storage fileAccess = files[_ipfsCid];
        
        // Owner has full access
        if (fileAccess.owner == _user) {
            return Permission.FULL;
        }
        
        return fileAccess.accessList[_user];
    }
    
    /**
     * @dev Remove a file from the system
     * @param _ipfsCid IPFS CID of the file to remove
     */
    function removeFile(string memory _ipfsCid) public {
        require(files[_ipfsCid].owner == msg.sender, "Only the owner can remove the file");
        
        // Remove from owner's files
        string[] storage userFiles = ownedFiles[msg.sender];
        for (uint i = 0; i < userFiles.length; i++) {
            if (keccak256(bytes(userFiles[i])) == keccak256(bytes(_ipfsCid))) {
                // Swap with the last element and pop
                userFiles[i] = userFiles[userFiles.length - 1];
                userFiles.pop();
                break;
            }
        }
        
        // Mark as deleted by clearing owner
        delete files[_ipfsCid];
        
        emit FileRemoved(_ipfsCid);
    }
    
    /**
     * @dev Get all files owned by the caller
     * @return Array of IPFS CIDs
     */
    function getMyFiles() public view returns (string[] memory) {
        return ownedFiles[msg.sender];
    }
    
    /**
     * @dev Get all users who have access to a file
     * @param _ipfsCid IPFS CID of the file
     * @return Array of user addresses
     */
    function getAuthorizedUsers(string memory _ipfsCid) public view returns (address[] memory) {
        require(files[_ipfsCid].owner == msg.sender, "Only the owner can view authorized users");
        return files[_ipfsCid].authorizedUsers;
    }
    
    /**
     * @dev Check if a file exists in the system
     * @param _ipfsCid IPFS CID to check
     * @return True if file exists
     */
    function fileExists(string memory _ipfsCid) public view returns (bool) {
        return files[_ipfsCid].owner != address(0);
    }
    
    /**
     * @dev Get the owner of a file
     * @param _ipfsCid IPFS CID of the file
     * @return Owner address
     */
    function getFileOwner(string memory _ipfsCid) public view returns (address) {
        return files[_ipfsCid].owner;
    }
}
