// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Token} from "../src/Token.sol";

contract Vesting {
    // Mapping of addresses to their vesting schedules
    // mapping(address => mapping(uint256 => VestingSchedule)) public vestingSchedules;
    struct Organization {
        string organizationName;
        address owner;
        Token token;
    }

    struct StakeHolder {
        uint256 vestingPeriod;
        uint256 amount;
        uint256 startTime;
        bool claimed;
    }

    mapping(address => Organization) private s_organizations;
    mapping(address => mapping(address => StakeHolder)) s_organizationStakeHolder;
    // mapping(address => StakeHolder) stakeholders;

    /**
     * Events
     */
    event OrganizationRegistered(string indexed organizationName, address owner);
    event StakeHolderAdded(string indexed organizationName, address stakeHolder, uint256 vestingPeriod, uint256 amount);

    /**
     * Error
     */
    error Vesting__OrganizationExits();
    error Vesting__OnlyOrganizationOwner(address callerAddress);
    error Vesting__VestingPeriodLessThanZero(uint256 period);
    error Vesting__VestingAmountLessThanZero();
    error Vesting__OrganizationDoesNotExits();
    error Vesting__InvalidStakeHolderAddress();

    function register(
        string calldata _organizationName,
        string calldata tokenName,
        string calldata tokenSymbol,
        uint256 intialSupply
    ) external {
        if (s_organizations[msg.sender].owner != address(0)) revert Vesting__OrganizationExits();
        Token token = new Token(tokenName, tokenSymbol, intialSupply);

        s_organizations[msg.sender] =
            Organization({organizationName: _organizationName, owner: msg.sender, token: token});

        emit OrganizationRegistered(_organizationName, msg.sender);
    }

    function addStakeholder(address _stakeHolder, uint256 _amount, uint256 _vestingPeriod) external {
        if (_stakeHolder == address(0)) {
            revert Vesting__InvalidStakeHolderAddress();
        }
        if (_vestingPeriod <= 0) {
            revert Vesting__VestingPeriodLessThanZero(_vestingPeriod);
        }

        if (_amount <= 0) {
            revert Vesting__VestingAmountLessThanZero();
        }

        if (s_organizations[msg.sender].owner == address(0)) revert Vesting__OrganizationDoesNotExits();

        if (s_organizations[msg.sender].owner != msg.sender) {
            revert Vesting__OnlyOrganizationOwner(msg.sender);
        }

        address organizationOwner = s_organizations[msg.sender].owner;
        s_organizationStakeHolder[organizationOwner][_stakeHolder] =
            StakeHolder({vestingPeriod: _vestingPeriod, amount: _amount, startTime: block.timestamp, claimed: false});

        emit StakeHolderAdded(s_organizations[msg.sender].organizationName, _stakeHolder, _vestingPeriod, _amount);
    }

    function getOrganization(address owner) external view returns (Organization memory) {
        return s_organizations[owner];
    }

    function getStakeholder(address organizationOWner, address stakeHolder) external view returns (StakeHolder memory) {
        return s_organizationStakeHolder[organizationOWner][stakeHolder];
    }

    // modifier onlyOrganizationOwner(address callerAddress) {
    //     if (s_organizations[callerAddress].owner != address(0)) revert Vesting__OrganizationDoesNotExits();

    //     if (s_organizations[msg.sender].owner != callerAddress) {
    //         revert Vesting__OnlyOrganizationOwner(callerAddress);
    //     }
    //     require(s_organizations[msg.sender].owner == msg.sender, "Only organization owner can call this");
    //      _;
    // }
}
