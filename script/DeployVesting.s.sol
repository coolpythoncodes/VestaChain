// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {Vesting} from "../src/Vesting.sol";

contract DeployVesting is Script {
    function run() external returns (Vesting) {
        vm.startBroadcast();
        Vesting vesting = new Vesting();
        vm.stopBroadcast();
        return vesting;
    }
}
