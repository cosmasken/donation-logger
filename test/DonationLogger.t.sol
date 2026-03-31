// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/DonationLogger.sol";

contract DonationLoggerTest is Test {
    DonationLogger public campaign;
    address public creator = address(0x1);
    address public donor1 = address(0x2);
    address public donor2 = address(0x3);
    
    uint256 constant DURATION_DAYS = 30;
    
    function setUp() public {
        vm.prank(creator);
        campaign = new DonationLogger(DURATION_DAYS * 1 days, creator);
        
        vm.deal(donor1, 10 ether);
        vm.deal(donor2, 10 ether);
    }
    
    function testDonate() public {
        vm.prank(donor1);
        campaign.donate{value: 1 ether}("Great cause!");
        
        assertEq(campaign.totalRaised(), 1 ether);
    }
    
    function testMultipleDonations() public {
        vm.prank(donor1);
        campaign.donate{value: 1 ether}("First donation");
        
        vm.prank(donor2);
        campaign.donate{value: 2 ether}("Second donation");
        
        assertEq(campaign.totalRaised(), 3 ether);
    }
    
    function testCannotDonateZero() public {
        vm.prank(donor1);
        vm.expectRevert("Must send ETH");
        campaign.donate{value: 0}("No money");
    }
    
    function testCannotDonateAfterDeadline() public {
        vm.warp(block.timestamp + DURATION_DAYS * 1 days + 1);
        
        vm.prank(donor1);
        vm.expectRevert("Campaign ended");
        campaign.donate{value: 1 ether}("Too late");
    }
    
    function testWithdrawAfterDeadline() public {
        vm.prank(donor1);
        campaign.donate{value: 1 ether}("Donation");
        
        vm.warp(block.timestamp + DURATION_DAYS * 1 days + 1);
        
        uint256 balanceBefore = creator.balance;
        vm.prank(creator);
        campaign.withdraw();
        
        assertEq(creator.balance, balanceBefore + 1 ether);
        assertEq(campaign.totalRaised(), 0);
    }
    
    function testOnlyCreatorCanWithdraw() public {
        vm.prank(donor1);
        campaign.donate{value: 1 ether}("Donation");
        
        vm.warp(block.timestamp + DURATION_DAYS * 1 days + 1);
        
        vm.prank(donor1);
        vm.expectRevert("Not creator");
        campaign.withdraw();
    }
    
    function testCannotWithdrawBeforeDeadline() public {
        vm.prank(donor1);
        campaign.donate{value: 1 ether}("Donation");
        
        vm.prank(creator);
        vm.expectRevert("Campaign still active");
        campaign.withdraw();
    }
    
    function testTimeRemaining() public {
        uint256 remaining = campaign.timeRemaining();
        assertEq(remaining, DURATION_DAYS * 1 days);
        
        vm.warp(block.timestamp + DURATION_DAYS * 1 days / 2);
        remaining = campaign.timeRemaining();
        assertEq(remaining, DURATION_DAYS * 1 days / 2);
        
        vm.warp(block.timestamp + DURATION_DAYS * 1 days);
        remaining = campaign.timeRemaining();
        assertEq(remaining, 0);
    }
    
    function testIsActive() public {
        assertTrue(campaign.isActive());
        
        vm.warp(block.timestamp + DURATION_DAYS * 1 days + 1);
        assertFalse(campaign.isActive());
    }
    
    function testWithdrawEmitsEvent() public {
        vm.prank(donor1);
        campaign.donate{value: 1 ether}("Donation");
        
        vm.warp(block.timestamp + DURATION_DAYS * 1 days + 1);
        
        vm.expectEmit(true, false, false, true);
        emit DonationLogger.FundsWithdrawn(creator, 1 ether);
        
        vm.prank(creator);
        campaign.withdraw();
    }
}
