// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../AgentStreak.sol";
import "../MockRegistry.sol";

contract AgentStreakTest is Test {
    AgentStreak public streak;
    MockRegistry public registry;

    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);

    // 2026-11-18 00:00:00 UTC — a clean UTC-day boundary for warp tests.
    uint256 constant DAY0 = 1794940800;

    function setUp() public {
        registry = new MockRegistry();
        streak = new AgentStreak(address(registry));
        registry.mint(alice, "octafx");
        vm.warp(DAY0);
    }

    function testNonHolderReverts() public {
        vm.prank(bob);
        vm.expectRevert("Not an Agent ID holder");
        streak.checkIn();
    }

    function testFirstCheckInStartsStreakAtOne() public {
        vm.prank(alice);
        streak.checkIn();
        (string memory handle, uint256 cur, uint256 best, uint256 total, uint256 lastDay, bool can) =
            streak.getUser(alice);
        assertEq(handle, "octafx");
        assertEq(cur, 1);
        assertEq(best, 1);
        assertEq(total, 1);
        assertEq(lastDay, DAY0 / 86400);
        assertFalse(can);
    }

    function testDoubleCheckInSameDayReverts() public {
        vm.prank(alice);
        streak.checkIn();
        vm.prank(alice);
        vm.expectRevert("Already checked in today");
        streak.checkIn();
    }

    function testStreakIncrementsOnConsecutiveDays() public {
        vm.prank(alice);
        streak.checkIn();
        vm.warp(DAY0 + 86400);
        vm.prank(alice);
        streak.checkIn();
        vm.warp(DAY0 + 2 * 86400);
        vm.prank(alice);
        streak.checkIn();
        (string memory handle, uint256 cur, uint256 best, uint256 total, uint256 lastDay, bool can) =
            streak.getUser(alice);
        assertEq(handle, "octafx");
        assertEq(cur, 3);
        assertEq(best, 3);
        assertEq(total, 3);
        assertEq(lastDay, (DAY0 + 2 * 86400) / 86400);
        assertFalse(can);
        assertEq(streak.currentStreak(alice), 3);
        assertEq(streak.bestStreak(alice), 3);
        assertEq(streak.totalCheckIns(alice), 3);
    }

    function testStreakResetsToOneAfterMissedDay() public {
        vm.prank(alice);
        streak.checkIn();
        vm.warp(DAY0 + 86400);
        vm.prank(alice);
        streak.checkIn(); // streak 2
        vm.warp(DAY0 + 3 * 86400); // skipped one full day
        vm.prank(alice);
        streak.checkIn();
        assertEq(streak.currentStreak(alice), 1);
        assertEq(streak.bestStreak(alice), 2);
        assertEq(streak.totalCheckIns(alice), 3);
    }

    function testBestStreakTracksMax() public {
        vm.prank(alice);
        streak.checkIn(); // day 0, streak 1
        vm.warp(DAY0 + 86400);
        vm.prank(alice);
        streak.checkIn(); // streak 2
        vm.warp(DAY0 + 3 * 86400); // miss a day
        vm.prank(alice);
        streak.checkIn(); // streak 1 again, best stays 2
        assertEq(streak.bestStreak(alice), 2);
        assertEq(streak.currentStreak(alice), 1);
    }

    function testEventEmittedWithCorrectHandleDayStreak() public {
        uint256 day = DAY0 / 86400;
        vm.expectEmit(true, false, false, true, address(streak));
        emit AgentStreak.CheckIn(alice, "octafx", day, 1);
        vm.prank(alice);
        streak.checkIn();
    }

    function testGetUserForNonHolder() public view {
        (string memory handle, uint256 cur, uint256 best, uint256 total, uint256 lastDay, bool can) =
            streak.getUser(bob);
        assertEq(handle, "");
        assertEq(cur, 0);
        assertEq(best, 0);
        assertEq(total, 0);
        assertEq(lastDay, 0);
        assertTrue(can);
    }

    function testZeroRegistryReverts() public {
        vm.expectRevert("Registry address is zero");
        new AgentStreak(address(0));
    }
}
