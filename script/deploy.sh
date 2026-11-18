#!/usr/bin/env bash
# AgentStreak deploy + end-to-end check-in.
# Usage (BSC testnet, chain 97):
#   RPC_URL=https://bsc-testnet-rpc.publicnode.com ./script/deploy.sh
# Usage (local anvil, chain 31337):
#   RPC_URL=http://127.0.0.1:8545 ./script/deploy.sh
# The test wallet key is read from .test-wallet.json (mode 600) and never printed.
# The registry deployed here is the MOCK registry — BSC testnet has no Agent ID
# registry. Mainnet deploys point at the real registry instead:
#   0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F
# and skip the mock deploy + mint steps.
set -euo pipefail
cd "$(dirname "$0")/.."
export FOUNDRY_DISABLE_NIGHTLY_WARNING=1
export PATH="$HOME/.foundry/bin:$PATH"

RPC_URL="${RPC_URL:-https://bsc-testnet-rpc.publicnode.com}"
HANDLE="${HANDLE:-teststreak}"
ADDR=$(python3 -c "import json; print(json.load(open('.test-wallet.json'))['address'])")
PK=$(python3 -c "import json; print(json.load(open('.test-wallet.json'))['private_key'])")

echo "deployer: $ADDR"
echo "rpc: $RPC_URL"
echo "balance: $(cast balance "$ADDR" --rpc-url "$RPC_URL") wei"

forge build --quiet

MOCK_BYTECODE=$(python3 -c "import json; print(json.load(open('out/MockRegistry.sol/MockRegistry.json'))['bytecode']['object'])")
STREAK_BYTECODE=$(python3 -c "import json; print(json.load(open('out/AgentStreak.sol/AgentStreak.json'))['bytecode']['object'])")

echo "--- deploying MockRegistry..."
MOCK_TX=$(cast send --rpc-url "$RPC_URL" --private-key "$PK" --create "$MOCK_BYTECODE" --json)
MOCK_ADDR=$(echo "$MOCK_TX" | python3 -c "import json,sys; print(json.load(sys.stdin)['contractAddress'])")
echo "mock registry: $MOCK_ADDR (tx: $(echo "$MOCK_TX" | python3 -c "import json,sys; print(json.load(sys.stdin)['transactionHash'])"))"

echo "--- minting mock Agent ID '$HANDLE' to deployer..."
MINT_TX=$(cast send --rpc-url "$RPC_URL" --private-key "$PK" "$MOCK_ADDR" "mint(address,string)" "$ADDR" "$HANDLE" --json)
echo "mint tx: $(echo "$MINT_TX" | python3 -c "import json,sys; print(json.load(sys.stdin)['transactionHash'])")"
echo "balanceOf(deployer) on mock: $(cast call --rpc-url "$RPC_URL" "$MOCK_ADDR" "balanceOf(address)(uint256)" "$ADDR")"
echo "handleOf(deployer) on mock: $(cast call --rpc-url "$RPC_URL" "$MOCK_ADDR" "handleOf(address)(string)" "$ADDR")"

echo "--- deploying AgentStreak (registry = mock)..."
CTOR=$(cast abi-encode "constructor(address)" "$MOCK_ADDR" | cut -c3-)
STREAK_TX=$(cast send --rpc-url "$RPC_URL" --private-key "$PK" --create "${STREAK_BYTECODE}${CTOR}" --json)
STREAK_ADDR=$(echo "$STREAK_TX" | python3 -c "import json,sys; print(json.load(sys.stdin)['contractAddress'])")
echo "agentstreak: $STREAK_ADDR (tx: $(echo "$STREAK_TX" | python3 -c "import json,sys; print(json.load(sys.stdin)['transactionHash'])"))"

echo "--- checkIn()..."
CHECKIN_TX=$(cast send --rpc-url "$RPC_URL" --private-key "$PK" "$STREAK_ADDR" "checkIn()" --json)
echo "check-in tx: $(echo "$CHECKIN_TX" | python3 -c "import json,sys; print(json.load(sys.stdin)['transactionHash'])")"

echo "--- getUser(deployer)..."
cast call --rpc-url "$RPC_URL" "$STREAK_ADDR" "getUser(address)(string,uint256,uint256,uint256,uint256,bool)" "$ADDR"
echo "currentStreak: $(cast call --rpc-url "$RPC_URL" "$STREAK_ADDR" "currentStreak(address)(uint256)" "$ADDR")"

echo "--- second checkIn today (must revert 'Already checked in today')..."
# NOTE: cast exits non-zero on a revert (it fails at gas estimation), so capture
# the output first and grep it — do NOT pipe cast straight into grep under
# `set -o pipefail`, or the pipeline reports cast's exit code, not grep's.
cast send --rpc-url "$RPC_URL" --private-key "$PK" "$STREAK_ADDR" "checkIn()" > /tmp/agentstreak-second-checkin.out 2>&1 || true
if grep -qi "Already checked in today" /tmp/agentstreak-second-checkin.out; then
  echo "OK: second check-in reverted as expected"
else
  echo "UNEXPECTED: second check-in did not revert"
  cat /tmp/agentstreak-second-checkin.out
  exit 1
fi

echo "--- summary ---"
echo "MOCK_REGISTRY=$MOCK_ADDR"
echo "AGENTSTREAK=$STREAK_ADDR"
