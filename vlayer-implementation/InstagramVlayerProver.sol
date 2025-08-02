// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Strings} from "@openzeppelin-contracts/utils/Strings.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Prover} from "vlayer-0.1.0/Prover.sol";
import {Web, WebProof, WebProofLib, WebLib} from "vlayer-0.1.0/WebProof.sol";

contract InstagramVlayerProver is Prover {
    using Strings for string;
    using WebProofLib for WebProof;
    using WebLib for Web;

    // Instagram API endpoint for user profile
    string constant INSTAGRAM_API_URL = "https://api.instagram.com/v1/users/self";

    function verifyInstagramAccount(
        WebProof calldata webProof, 
        address account
    ) public view returns (Proof memory, string memory, address, uint256) {
        // Verify the web proof against Instagram API
        Web memory web = webProof.verify(INSTAGRAM_API_URL);

        // Extract username from Instagram API JSON response
        // Expected format: {"data": {"username": "user123", "id": "123456", ...}}
        string memory username = web.jsonGetString("data.username");
        uint256 userId = uint256(web.jsonGetInt("data.id"));
        
        // Ensure username is not empty
        require(bytes(username).length > 0, "Username cannot be empty");
        require(userId > 0, "User ID must be valid");

        return (proof(), username, account, userId);
    }

    // Alternative implementation for Instagram web interface (non-API)
    function verifyInstagramAccountWeb(
        WebProof calldata webProof,
        address account
    ) public view returns (Proof memory, string memory, address) {
        // Verify against Instagram web interface
        Web memory web = webProof.verifyWithUrlPrefix("https://www.instagram.com/");
        
        // Extract username from page content or URL
        // This would require parsing HTML or extracting from URL path
        // Implementation depends on what Instagram data is available
        
        // For now, placeholder implementation
        string memory username = extractUsernameFromContent(web.body);
        
        return (proof(), username, account);
    }

    // Helper function to extract username from Instagram web content
    function extractUsernameFromContent(string memory content) 
        private 
        pure 
        returns (string memory) 
    {
        // This would contain regex logic to extract username
        // from Instagram web page content
        // Implementation would depend on Instagram's page structure
        
        // Placeholder - in real implementation, would use regex
        // to find patterns like: "username":"actual_username"
        return "extracted_username";
    }
}