// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";

import {DeployVesting} from "../script/DeployVesting.s.sol";
import {Vesting} from "../src/Vesting.sol";
import {Constants} from "./Constants.sol";

contract VestingTest is Test {
    string private constant ORGANIZATION_NAME = "Organization";
    uint256 private constant INITIAL_SUPPLY = 1000 ether;
    string private constant TOKEN_NAME = "Rapture";
    string private constant TOKEN_SYMBOL = "RAP";

    Vesting public vesting;

    DeployVesting public deployer;
    address organizationOwner = makeAddr("organizationOwner");
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

    function testRegisterOrganizationFailsIfAlreadyRegistered() public registered {
        vm.expectRevert(Vesting.Vesting__OrganizationExits.selector);
        vm.startPrank(organizationOwner);
        vesting.register(
            Constants.ORGANIZATION_NAME, Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, Constants.INITIAL_SUPPLY
        );
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

    // function testAddStakeholderFailsIfNotOwner() public registered {
    //     vm.expectRevert(abi.encodeWithSelector(Vesting.Vesting__OnlyOrganizationOwner.selector, alice));
    //     vm.startPrank(alice);
    //     vesting.addStakeholder(stakeHolder, Constants.STAKING_AMOUNT, Constants.VESTING_PERIOD);
    //     vm.stopPrank();
    // }

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

    modifier registered() {
        vm.startPrank(organizationOwner);
        vesting.register(
            Constants.ORGANIZATION_NAME, Constants.TOKEN_NAME, Constants.TOKEN_SYMBOL, Constants.INITIAL_SUPPLY
        );
        vm.stopPrank();
        _;
    }
}
