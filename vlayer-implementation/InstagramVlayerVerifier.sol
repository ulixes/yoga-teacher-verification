// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {InstagramVlayerProver} from "./InstagramVlayerProver.sol";
import {Proof} from "vlayer/Proof.sol";
import {Verifier} from "vlayer/Verifier.sol";
import {ERC721} from "@openzeppelin-contracts/token/ERC721/ERC721.sol";

contract InstagramVlayerVerifier is Verifier, ERC721 {
    address public prover;
    
    // Track verified usernames to prevent duplicates
    mapping(string => bool) public verifiedUsernames;
    mapping(address => string) public accountToUsername;
    mapping(string => address) public usernameToAccount;
    
    // Track verification method used
    mapping(uint256 => string) public tokenIdToMethod; // "vlayer" for vlayer proofs
    
    event InstagramVerified(
        address indexed account, 
        string username, 
        uint256 tokenId,
        string method
    );

    constructor(address _prover) ERC721("VlayerInstagramNFT", "VINFT") {
        prover = _prover;
    }

    function verifyAndMint(
        Proof calldata proof,
        string memory username,
        address account,
        uint256 userId
    ) public onlyVerified(prover, InstagramVlayerProver.verifyInstagramAccount.selector) {
        require(!verifiedUsernames[username], "Username already verified");
        require(bytes(accountToUsername[account]).length == 0, "Account already has verified username");
        
        // Mark username as verified
        verifiedUsernames[username] = true;
        accountToUsername[account] = username;
        usernameToAccount[username] = account;
        
        // Create unique token ID based on username and method
        uint256 tokenId = uint256(keccak256(abi.encodePacked(username, "vlayer")));
        tokenIdToMethod[tokenId] = "vlayer";
        
        _safeMint(account, tokenId);
        
        emit InstagramVerified(account, username, tokenId, "vlayer");
    }

    function verifyAndMintWeb(
        Proof calldata proof,
        string memory username,
        address account
    ) public onlyVerified(prover, InstagramVlayerProver.verifyInstagramAccountWeb.selector) {
        require(!verifiedUsernames[username], "Username already verified");
        require(bytes(accountToUsername[account]).length == 0, "Account already has verified username");
        
        // Mark username as verified
        verifiedUsernames[username] = true;
        accountToUsername[account] = username;
        usernameToAccount[username] = account;
        
        // Create unique token ID for web verification
        uint256 tokenId = uint256(keccak256(abi.encodePacked(username, "vlayer-web")));
        tokenIdToMethod[tokenId] = "vlayer-web";
        
        _safeMint(account, tokenId);
        
        emit InstagramVerified(account, username, tokenId, "vlayer-web");
    }

    function getVerificationMethod(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenIdToMethod[tokenId];
    }

    function isUsernameVerified(string memory username) public view returns (bool) {
        return verifiedUsernames[username];
    }

    function getAccountForUsername(string memory username) public view returns (address) {
        require(verifiedUsernames[username], "Username not verified");
        return usernameToAccount[username];
    }

    function getUsernameForAccount(address account) public view returns (string memory) {
        return accountToUsername[account];
    }
}