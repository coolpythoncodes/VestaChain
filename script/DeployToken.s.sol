// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {Token} from "../src/Token.sol";

contract DeployToken is Script {
    function run(string calldata name, string calldata symbol, uint256 initialSupply) external returns (Token) {
        vm.startBroadcast();
        Token token = new Token(name, symbol, initialSupply);
        vm.stopBroadcast();
        return token;
    }
}
