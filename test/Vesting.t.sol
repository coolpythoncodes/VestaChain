// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";

import {DeployVesting} from "../script/DeployVesting.s.sol";
import {Vesting} from "../src/Vesting.sol";
import {Constants} from "./Constants.sol";

contract VestingTest is Test {
    Vesting public vesting;

    DeployVesting public deployer;
    address organizationOwner = makeAddr("organizationOwner");
    address organizationOwner2 = makeAddr("organizationOwner2");
    address alice = makeAddr("alice");
    address stakeHolder = makeAddr("stakeHolder");

    function setUp() public {
        deployer = new DeployVesting();
        vesting = deployer.run();
    }

    function testRegisterOrganizationSuccessfully() public {
        vm.startPrank(organizationOwner);
        vesting.register(
            Constants.ORGANIZATION_NAME, Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, Constants.INITIAL_SUPPLY
        );
        vm.stopPrank();

        Vesting.Organization memory organization = vesting.getOrganization(organizationOwner);

        assertEq(organization.owner, organizationOwner);
        assertEq(organization.organizationName, Constants.ORGANIZATION_NAME);
    }

    function testTotalVestingAmountShouldBeZeroAfterRegistering() public {
        vm.startPrank(organizationOwner);
        vesting.register(
            Constants.ORGANIZATION_NAME, Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, Constants.INITIAL_SUPPLY
        );
        vm.stopPrank();

        assertEq(vesting.getTotalVestedAmount(organizationOwner), 0);
    }

    function testRegisterOrganizationFailsIfAlreadyRegistered() public registered {
        vm.expectRevert(Vesting.Vesting__OrganizationExits.selector);
        vm.startPrank(organizationOwner);
        vesting.register(
            Constants.ORGANIZATION_NAME, Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, Constants.INITIAL_SUPPLY
        );
        vm.stopPrank();
    }

    function testRegisterOrganizationFailsIfInitalSupplyIsZero() public {
        vm.expectRevert(Vesting.Vesting__InitialTokenSupplyIsLow.selector);
        vm.startPrank(organizationOwner);
        vesting.register(Constants.ORGANIZATION_NAME, Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, 0);
        vm.stopPrank();
    }

    function testRegisterOrganizationEmitsCorrectEvent() public {
        vm.expectEmit(address(vesting));

        emit Vesting.OrganizationRegistered(Constants.ORGANIZATION_NAME, organizationOwner);

        vm.startPrank(organizationOwner);
        vesting.register(
            Constants.ORGANIZATION_NAME, Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, Constants.INITIAL_SUPPLY
        );
        vm.stopPrank();
    }

    function testAddStakeholderFailsIfVestingPeriodIsZeroOrLess() public {
        vm.expectRevert(abi.encodeWithSelector(Vesting.Vesting__VestingPeriodLessThanZero.selector, 0));
        vm.startPrank(organizationOwner);
        vesting.addStakeholder(stakeHolder, Constants.STAKING_AMOUNT, 0);
        vm.stopPrank();
    }

    function testAddStakeholderFailsIfAmountIsZeroOrLess() public {
        vm.expectRevert(Vesting.Vesting__VestingAmountLessThanZero.selector);
        vm.startPrank(organizationOwner);
        vesting.addStakeholder(stakeHolder, 0 ether, Constants.VESTING_PERIOD);
        vm.stopPrank();
    }

    function testAddAddressZeroAsStakeholder() public {
        vm.expectRevert(Vesting.Vesting__InvalidStakeHolderAddress.selector);
        vm.startPrank(organizationOwner);
        vesting.addStakeholder(address(0), Constants.STAKING_AMOUNT, Constants.VESTING_PERIOD);
        vm.stopPrank();
    }

    function testAddStakeholderSuccessfully() public registered {
        vm.startPrank(organizationOwner);
        // Vesting.Organization memory organization = vesting.getOrganization(organizationOwner);

        vesting.addStakeholder(stakeHolder, Constants.STAKING_AMOUNT, Constants.VESTING_PERIOD);
        // Vesting.Organization memory organization = vesting.getOrganization(organizationOwner);
        vm.stopPrank();
        Vesting.StakeHolder memory _stakeHolder = vesting.getStakeholder(organizationOwner, stakeHolder);
        assertEq(_stakeHolder.vestingPeriod, Constants.VESTING_PERIOD);
        assertEq(_stakeHolder.amount, Constants.STAKING_AMOUNT);
        assertEq(_stakeHolder.claimed, false);
    }

    function testAddStakeholderEmitsCorrectEvent() public registered {
        vm.expectEmit(address(vesting));

        emit Vesting.StakeHolderAdded(
            Constants.ORGANIZATION_NAME, stakeHolder, Constants.VESTING_PERIOD, Constants.STAKING_AMOUNT
        );
        vm.startPrank(organizationOwner);
        vesting.addStakeholder(stakeHolder, Constants.STAKING_AMOUNT, Constants.VESTING_PERIOD);
        vm.stopPrank();
    }

    function testRegisterOrganization_ShouldRevertIfTokenBalanceIsNotSufficient() public registered {
        vm.expectRevert(Vesting.Vesting__InsufficientTokenBalanceToVest.selector);
        vm.startPrank(organizationOwner);
        vesting.addStakeholder(stakeHolder, Constants.INITIAL_SUPPLY * 2, Constants.VESTING_PERIOD);
        vm.stopPrank();
    }

    function testCorrectListOfOrganizationForAStakeholder() public {
        vm.startPrank(organizationOwner);
        vesting.register(
            Constants.ORGANIZATION_NAME, Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, Constants.INITIAL_SUPPLY
        );

        vesting.addStakeholder(stakeHolder, Constants.STAKING_AMOUNT, Constants.VESTING_PERIOD);
        vm.stopPrank();

        vm.startPrank(organizationOwner2);
        vesting.register(
            Constants.ORGANIZATION_NAME, Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, Constants.INITIAL_SUPPLY
        );

        vesting.addStakeholder(stakeHolder, Constants.STAKING_AMOUNT, Constants.VESTING_PERIOD);

        vm.stopPrank();

        assertEq(vesting.getOrganizationsForStakeholder(stakeHolder).length, 2);
    }

    function testClaimVestedTokens_ShouldRevertWhenCallerIsNotStakeholder() public registeredAndAddStakeholder {
        vm.expectRevert(abi.encodeWithSelector(Vesting.Vesting__CallerIsNotStakeholder.selector, alice));

        vm.startPrank(alice);
        vesting.claimVestedTokens(organizationOwner);
        vm.stopPrank();
    }

    function testClaimVestedTokens_ShouldRevertWhenTokensAlreadyClaimed() public registeredAndAddStakeholder {
        vm.warp(block.timestamp + Constants.VESTING_PERIOD + 1);
        vm.startPrank(stakeHolder);
        vesting.claimVestedTokens(organizationOwner);
        vm.stopPrank();
        vm.expectRevert(Vesting.Vesting__VestedTokensAlreadyClaimed.selector);
        vm.startPrank(stakeHolder);
        vesting.claimVestedTokens(organizationOwner);
        vm.stopPrank();
    }

    function testClaimVestedTokens_ShouldTransferCorrectAmountOfTokens() public registeredAndAddStakeholder {
        vm.warp(block.timestamp + Constants.VESTING_PERIOD + 1);

        vm.startPrank(stakeHolder);
        address[] memory stakeholderOrganizationArray = vesting.getOrganizationsForStakeholder(stakeHolder);
        uint256 startingTokenBalanceOfStakeholder =
            vesting.getOrganization(stakeholderOrganizationArray[0]).token.balanceOf(stakeHolder);
        vesting.claimVestedTokens(organizationOwner);
        uint256 newTokenBalanceOfStakeholder =
            vesting.getOrganization(stakeholderOrganizationArray[0]).token.balanceOf(stakeHolder);
        vm.stopPrank();

        assertEq(newTokenBalanceOfStakeholder, startingTokenBalanceOfStakeholder + Constants.STAKING_AMOUNT);
    }

    function testClaimVestedTokens_ShouldEmitVestedTokenClaimedEvent() public registeredAndAddStakeholder {
        vm.warp(block.timestamp + Constants.VESTING_PERIOD + 1);
        vm.expectEmit();

        emit Vesting.VestedTokenClaimed(stakeHolder, Constants.STAKING_AMOUNT);

        vm.startPrank(stakeHolder);
        vesting.claimVestedTokens(organizationOwner);
        vm.stopPrank();
    }

    function testWithdrawUnVestedTokens_ShouldRevertWhenCallerIsNotOrganizationOwner()
        public
        registeredAndAddStakeholder
    {
        vm.expectRevert(abi.encodeWithSelector(Vesting.Vesting__CallerIsNotOrganizationOwner.selector, alice));
        vm.startPrank(alice);
        vesting.WithdrawUnVestedTokens();
        vm.stopPrank();
    }

    function testWithdrawUnVestedTokens_ShouldRevertWhenInsufficientBalance() public {
        vm.startPrank(organizationOwner);
        vesting.register(
            Constants.ORGANIZATION_NAME, Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, Constants.INITIAL_SUPPLY
        );
        vesting.addStakeholder(stakeHolder, Constants.INITIAL_SUPPLY, Constants.VESTING_PERIOD);
        vm.stopPrank();

        vm.expectRevert(abi.encodeWithSelector(Vesting.Vesting__InsufficientUnVestedTokens.selector));
        vm.startPrank(organizationOwner);
        vesting.WithdrawUnVestedTokens();

        vm.stopPrank();
    }


    modifier registered() {
        vm.startPrank(organizationOwner);
        vesting.register(
            Constants.ORGANIZATION_NAME, Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, Constants.INITIAL_SUPPLY
        );
        vm.stopPrank();
        _;
    }

    modifier registeredAndAddStakeholder() {
        vm.startPrank(organizationOwner);
        vesting.register(
            Constants.ORGANIZATION_NAME, Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, Constants.INITIAL_SUPPLY
        );
        vesting.addStakeholder(stakeHolder, Constants.STAKING_AMOUNT, Constants.VESTING_PERIOD);

        vm.stopPrank();
        _;
    }
}
