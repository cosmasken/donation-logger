// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./DonationLogger.sol";

contract CampaignFactory {
    address[] public campaigns;
    mapping(address => address[]) public creatorCampaigns;
    
    event CampaignCreated(address indexed creator, address indexed campaign, uint256 duration, string title);
    
    function createCampaign(uint256 _durationSeconds, string calldata _title) external returns (address) {
        DonationLogger campaign = new DonationLogger(_durationSeconds, msg.sender);
        address campaignAddress = address(campaign);
        
        campaigns.push(campaignAddress);
        creatorCampaigns[msg.sender].push(campaignAddress);
        
        emit CampaignCreated(msg.sender, campaignAddress, _durationSeconds, _title);
        return campaignAddress;
    }
    
    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }
    
    function getCreatorCampaigns(address creator) external view returns (address[] memory) {
        return creatorCampaigns[creator];
    }
}
