// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BlogRegistry
 * @dev A smart contract to manage blog posts with IPFS hashes
 */
contract BlogRegistry is Ownable {
    struct Post {
        string ipfsHash;
        address author;
        uint256 timestamp;
        string title;
        bool exists;
    }

    // Events
    event PostCreated(string ipfsHash, address indexed author, uint256 indexed timestamp, string title);
    
    // Posts by IPFS hash
    mapping(string => Post) private posts;
    
    // Post hashes by author
    mapping(address => string[]) private authorPosts;
    
    // All post hashes in order of creation
    string[] private allPosts;
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Creates a new blog post
     * @param _ipfsHash IPFS hash of the post content
     * @param _title Title of the post
     */
    function createPost(string memory _ipfsHash, string memory _title) external {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(!posts[_ipfsHash].exists, "Post with this hash already exists");
        
        // Create post
        Post memory newPost = Post({
            ipfsHash: _ipfsHash,
            author: msg.sender,
            timestamp: block.timestamp,
            title: _title,
            exists: true
        });
        
        // Store post
        posts[_ipfsHash] = newPost;
        authorPosts[msg.sender].push(_ipfsHash);
        allPosts.push(_ipfsHash);
        
        // Emit event
        emit PostCreated(_ipfsHash, msg.sender, block.timestamp, _title);
    }
    
    /**
     * @dev Gets a post by its IPFS hash
     * @param _ipfsHash IPFS hash of the post
     * @return ipfsHash IPFS hash of the post
     * @return author Address of the post author
     * @return timestamp Creation time of the post
     * @return title Title of the post
     * @return exists Flag indicating if the post exists
     */
    function getPost(string memory _ipfsHash) external view returns (
        string memory ipfsHash,
        address author,
        uint256 timestamp,
        string memory title,
        bool exists
    ) {
        Post memory post = posts[_ipfsHash];
        return (post.ipfsHash, post.author, post.timestamp, post.title, post.exists);
    }
    
    /**
     * @dev Gets all posts by an author
     * @param _author Address of the author
     * @return Array of IPFS hashes
     */
    function getPostsByAuthor(address _author) external view returns (string[] memory) {
        return authorPosts[_author];
    }
    
    /**
     * @dev Gets all post hashes in the registry
     * @return Array of all IPFS hashes
     */
    function getAllPosts() external view returns (string[] memory) {
        return allPosts;
    }
    
    /**
     * @dev Gets total number of posts in the registry
     * @return Total post count
     */
    function getPostCount() external view returns (uint256) {
        return allPosts.length;
    }
    
    /**
     * @dev Gets post hashes with pagination
     * @param _offset Starting index
     * @param _limit Maximum number of posts to return
     * @return Array of IPFS hashes for the requested page
     */
    function getPaginatedPosts(uint256 _offset, uint256 _limit) external view returns (string[] memory) {
        require(_offset < allPosts.length, "Offset out of bounds");
        
        uint256 resultLength = _limit;
        if (_offset + _limit > allPosts.length) {
            resultLength = allPosts.length - _offset;
        }
        
        string[] memory result = new string[](resultLength);
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allPosts[allPosts.length - 1 - (_offset + i)]; // Return newest first
        }
        
        return result;
    }
}
