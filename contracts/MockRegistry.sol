// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockRegistry — test-only stand-in for the Binance Agent ID HandleRegistry
/// @notice BSC TESTNET ONLY. There is no Agent ID registry on BSC testnet, so
///         AgentStreak testnet deployments point at this mock instead of the
///         real registry. It implements only the two views AgentStreak calls:
///         balanceOf(address) and handleOf(address).
///         NEVER use on mainnet: mainnet deployments point at the real registry
///         0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F.
contract MockRegistry {
    mapping(address => string) public handles;

    event MockAgentIdMinted(address indexed to, string handle);

    function mint(address to, string calldata handle) external {
        require(bytes(handle).length > 0, "Empty handle");
        require(bytes(handles[to]).length == 0, "Already has a mock Agent ID");
        handles[to] = handle;
        emit MockAgentIdMinted(to, handle);
    }

    function balanceOf(address owner) external view returns (uint256) {
        return bytes(handles[owner]).length > 0 ? 1 : 0;
    }

    function handleOf(address owner) external view returns (string memory) {
        return handles[owner];
    }
}
