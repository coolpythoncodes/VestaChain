// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Token} from "../src/Token.sol";

/// @title Vesting Contract
/// @author Rapture Chijioke Godson
/// @notice This contract allows an organization to register itself, create a token, and manage vesting schedules for stakeholders.

contract Vesting {
    struct Organization {
        string organizationName;
        address owner;
        Token token;
        address[] stakeholders;
    }

    struct StakeHolder {
        uint256 vestingPeriod;
        uint256 amount;
        uint256 startTime;
        bool claimed;
        address stakeholder;
        Token organizationTokenAddress;
    }

    mapping(address organizationOWnerAddress => Organization) private s_organizations;
    mapping(address organizationOWnerAddress => mapping(address stakeHolderAddress => StakeHolder))
        s_organizationStakeHolder;
    mapping(address stakeHolderAddress => address[] organizationOwnerAddress) private s_stakeholderOrganizations;
    mapping(address organizationOwner => uint256) private totalVestedAmount;
    // mapping(address => StakeHolder) stakeholders;

    /**
     * Events
     */
    event OrganizationRegistered(string indexed organizationName, address owner);
    event StakeHolderAdded(string indexed organizationName, address stakeHolder, uint256 vestingPeriod, uint256 amount);
    event VestedTokenClaimed(address indexed stakeholder, uint256 amount);
    /**
     * Error
     */

    error Vesting__OrganizationExits();
    error Vesting__InitialTokenSupplyIsLow();
    error Vesting__OnlyOrganizationOwner(address callerAddress);
    error Vesting__VestingPeriodLessThanZero(uint256 period);
    error Vesting__VestingAmountLessThanZero();
    error Vesting__OrganizationDoesNotExits();
    error Vesting__InvalidStakeHolderAddress();
    error Vesting__VestedTokensAlreadyClaimed();
    error Vesting__VestPeriodNotOver();
    error Vesting__CallerIsNotStakeholder(address callerAddress);
    error Vesting__CallerIsNotOrganizationOwner(address callerAddress);
    error Vesting__InsufficientTokenBalanceToVest();
    error Vesting__InsufficientUnVestedTokens();
    error Vesting__StakeholderAlreadyAdded();

    /**
     * @notice Registers a new organization and creates a token for it.
     * @param _organizationName Name of the organization
     * @param tokenName Name of the token to be created
     * @param tokenSymbol Symbol of the token to be created
     * @param intialSupply Initial supply of tokens to be minted
     */
    function register(
        string calldata _organizationName,
        string calldata tokenName,
        string calldata tokenSymbol,
        uint256 intialSupply
    ) external {
        if (s_organizations[msg.sender].owner != address(0)) {
            revert Vesting__OrganizationExits();
        }

        if (intialSupply <= 0) revert Vesting__InitialTokenSupplyIsLow();

        Token token = new Token(tokenName, tokenSymbol, intialSupply);

        // token.transferFrom(msg.sender, address(this), intialSupply);

        s_organizations[msg.sender].organizationName = _organizationName;
        s_organizations[msg.sender].owner = msg.sender;
        s_organizations[msg.sender].token = token;
        totalVestedAmount[msg.sender] = 0;

        emit OrganizationRegistered(_organizationName, msg.sender);
    }

    /**
     * @notice Adds a new stakeholder to an organization.
     * @dev Only the owner of an organization can add stakeholders. Tokens are transferred from the owner's address to this contract.
     * @param _stakeHolder Address of the stakeholder
     * @param _amount Amount of tokens to be vested
     * @param _vestingPeriod Duration of vesting in seconds
     */
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

        if (s_organizations[msg.sender].token.balanceOf(address(this)) < totalVestedAmount[msg.sender] + _amount) {
            revert Vesting__InsufficientTokenBalanceToVest();
        }

        if (s_organizations[msg.sender].owner == address(0)) {
            revert Vesting__OrganizationDoesNotExits();
        }

        if (s_organizations[msg.sender].owner != msg.sender) {
            revert Vesting__OnlyOrganizationOwner(msg.sender);
        }

        address organizationOwner = s_organizations[msg.sender].owner;

        if (s_organizationStakeHolder[organizationOwner][_stakeHolder].stakeholder == _stakeHolder) {
            revert Vesting__StakeholderAlreadyAdded();
        }

        Token organizationTokenAddress = s_organizations[msg.sender].token;
        s_organizations[msg.sender].stakeholders.push(_stakeHolder);
        s_organizationStakeHolder[organizationOwner][_stakeHolder] = StakeHolder({
            vestingPeriod: _vestingPeriod,
            amount: _amount,
            startTime: block.timestamp,
            claimed: false,
            stakeholder: _stakeHolder,
            organizationTokenAddress: organizationTokenAddress
        });

        s_stakeholderOrganizations[_stakeHolder].push(organizationOwner);
        totalVestedAmount[msg.sender] = totalVestedAmount[msg.sender] + _amount;

        emit StakeHolderAdded(s_organizations[msg.sender].organizationName, _stakeHolder, _vestingPeriod, _amount);
    }

    function claimVestedTokens(address organizationOwnerAddress) external {
        StakeHolder storage stakeholder = s_organizationStakeHolder[organizationOwnerAddress][msg.sender];
        if (stakeholder.claimed) revert Vesting__VestedTokensAlreadyClaimed();

        if (block.timestamp < stakeholder.vestingPeriod + stakeholder.startTime) {
            revert Vesting__VestPeriodNotOver();
        }

        if (stakeholder.stakeholder != msg.sender) {
            revert Vesting__CallerIsNotStakeholder(msg.sender);
        }

        totalVestedAmount[organizationOwnerAddress] = totalVestedAmount[organizationOwnerAddress] - stakeholder.amount;

        Organization memory organization = s_organizations[organizationOwnerAddress];

        stakeholder.claimed = true;

        organization.token.transfer(msg.sender, stakeholder.amount);
        emit VestedTokenClaimed(msg.sender, stakeholder.amount);
    }

    function WithdrawUnVestedTokens() external {
        Organization memory organization = s_organizations[msg.sender];
        if (organization.owner != msg.sender) {
            revert Vesting__CallerIsNotOrganizationOwner(msg.sender);
        }
        if (organization.token.balanceOf(address(this)) <= totalVestedAmount[msg.sender]) {
            revert Vesting__InsufficientUnVestedTokens();
        }

        organization.token.transfer(
            msg.sender, organization.token.balanceOf(address(this)) - totalVestedAmount[msg.sender]
        );
    }

    /**
     * @notice Returns details about a stakeholder.
     * @param organizationOWner Address of the organization's owner
     * @param stakeHolder Address of the stakeholder
     * @return Details of the stakeholder
     */
    function getStakeholder(address organizationOWner, address stakeHolder)
        external
        view
        returns (StakeHolder memory)
    {
        return s_organizationStakeHolder[organizationOWner][stakeHolder];
    }

    function getOrganization(address owner) external view returns (Organization memory) {
        return s_organizations[owner];
    }

    /**
     * @notice Returns a list of organizations where the stakeholder has tokens vested.
     * @param stakeHolder Address of the stakeholder
     * @return Array of organization addresses
     */
    function getOrganizationsForStakeholder(address stakeHolder) external view returns (address[] memory) {
        return s_stakeholderOrganizations[stakeHolder];
    }

    function getTotalVestedAmount(address organizationOwnerAddress) external view returns (uint256) {
        return totalVestedAmount[organizationOwnerAddress];
    }
}
