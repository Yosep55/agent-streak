// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AgentStreak — daily on-chain check-in for Binance Agent ID holders
/// @notice A holder of a Binance Agent ID (an ERC-721 in the HandleRegistry)
///         may check in once per UTC day. Consecutive days build a streak.
///         No token, no fees, no owner, no admin powers, no payable functions.
///         The registry address is immutable and set once at deployment.
///         On BSC mainnet the registry is 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F.
///         On BSC testnet there is no Agent ID registry, so deployments there
///         point at a mock registry with the same interface instead.
interface IAgentIdRegistry {
    function balanceOf(address owner) external view returns (uint256);
    function handleOf(address owner) external view returns (string memory);
}

contract AgentStreak {
    IAgentIdRegistry public immutable registry;

    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public currentStreak;
    mapping(address => uint256) public bestStreak;
    mapping(address => uint256) public totalCheckIns;

    event CheckIn(address indexed user, string handle, uint256 day, uint256 streak);

    constructor(address registryAddress) {
        require(registryAddress != address(0), "Registry address is zero");
        registry = IAgentIdRegistry(registryAddress);
    }

    /// @notice Check in for today (UTC day = block.timestamp / 86400).
    /// @dev Reverts unless the caller holds at least one Agent ID and has
    ///      not already checked in today. A missed day resets the streak to 1.
    function checkIn() external {
        require(registry.balanceOf(msg.sender) > 0, "Not an Agent ID holder");
        uint256 day = block.timestamp / 86400;
        require(lastCheckInDay[msg.sender] != day, "Already checked in today");

        uint256 streak = lastCheckInDay[msg.sender] == day - 1
            ? currentStreak[msg.sender] + 1
            : 1;

        lastCheckInDay[msg.sender] = day;
        currentStreak[msg.sender] = streak;
        totalCheckIns[msg.sender] += 1;
        if (streak > bestStreak[msg.sender]) {
            bestStreak[msg.sender] = streak;
        }

        emit CheckIn(msg.sender, registry.handleOf(msg.sender), day, streak);
    }

    /// @notice Full streak state for a user, plus whether they can check in today.
    function getUser(address user)
        external
        view
        returns (
            string memory handle,
            uint256 streak,
            uint256 best,
            uint256 total,
            uint256 lastDay,
            bool canCheckInToday
        )
    {
        handle = registry.balanceOf(user) > 0 ? registry.handleOf(user) : "";
        streak = currentStreak[user];
        best = bestStreak[user];
        total = totalCheckIns[user];
        lastDay = lastCheckInDay[user];
        canCheckInToday = lastDay != block.timestamp / 86400;
    }
}
