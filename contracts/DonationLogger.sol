// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;  // Updated to a more recent minor version for better safety features

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DonationLogger is ReentrancyGuard {
    address public immutable creator;
    uint256 public totalRaised;
    uint256 public immutable deadline;
    bool public ended;

    event Donated(address indexed donor, uint256 amount, string message);
    event CampaignEnded(uint256 totalRaised);
    event FundsWithdrawn(address indexed creator, uint256 amount);

    constructor(uint256 _durationDays) {
        require(_durationDays > 0, "Duration must be positive");
        require(_durationDays <= 365, "Duration too long (max 1 year)");  // Optional bound to prevent absurd values

        creator = msg.sender;
        deadline = block.timestamp + _durationDays * 1 days;
    }

    modifier onlyBeforeDeadline() {
        require(block.timestamp < deadline, "Campaign ended");
        _;
    }

    modifier onlyNotEnded() {
        require(!ended, "Campaign already ended");
        _;
    }

    function donate(string calldata message) 
        external 
        payable 
        onlyBeforeDeadline 
        onlyNotEnded 
        nonReentrant 
    {
        require(msg.value > 0, "Must send ETH");
        totalRaised += msg.value;
        emit Donated(msg.sender, msg.value, message);
    }

    function endCampaign() external onlyNotEnded {
        require(block.timestamp >= deadline, "Not yet ended");
        ended = true;
        emit CampaignEnded(totalRaised);
    }

    function withdraw() 
        external 
        nonReentrant 
    {
        require(msg.sender == creator, "Not creator");
        require(block.timestamp >= deadline, "Campaign still active");
        uint256 amount = totalRaised;
        require(amount > 0, "No funds to withdraw");

        totalRaised = 0;  // Effects before interaction
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(msg.sender, amount);
    }

    // Optional: Helpful view for demo / observability
    function timeRemaining() external view returns (uint256) {
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }

    function isActive() external view returns (bool) {
        return !ended && block.timestamp < deadline;
    }
}