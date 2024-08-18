// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {DeployToken} from "../script/DeployToken.s.sol";
import {console} from "forge-std/console.sol";
import {Token} from "../src/Token.sol";
import {Constants} from "./Constants.sol";

contract TokenTest is Test {
    address alice = makeAddr("alice");

    Token public token;
    DeployToken public deployer;

    function setUp() public {
        deployer = new DeployToken();
        token = deployer.run(Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, Constants.INITIAL_SUPPLY);
    }

    function testContractInitializationWithCorrectNameSymbolAndInitialSupply() public view {
        assertEq(token.name(), Constants.TOKEN_NAME);
        assertEq(token.symbol(), Constants.TOKEN_SYMBOL);
        assertEq(token.totalSupply(), Constants.INITIAL_SUPPLY);
    }

    function testNonOwnerCannotMintTokens() public {
        vm.expectRevert();
        vm.prank(alice);
        token.mint(100 ether);
    }
}
