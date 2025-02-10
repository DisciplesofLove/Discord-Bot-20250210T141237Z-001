// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IDatasetGovernance.sol";
import "./JoyToken.sol";

/**
 * @title DatasetGovernance
 * @dev Manages dataset submissions and governance
 */
contract DatasetGovernance is IDatasetGovernance, AccessControl, Pausable, ReentrancyGuard {
    // Roles
    bytes32 public constant CURATOR_ROLE = keccak256("CURATOR_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");

    // Structs
    struct Dataset {
        address submitter;
        string ipfsHash;
        DatasetStatus status;
        uint256 submissionTime;
        uint256 size;
        string dataType;
        uint256 validations;
        mapping(address => bool) hasValidated;
        mapping(address => ValidationVote) validationVotes;
    }

    struct ValidationVote {
        bool hasVoted;
        bool approved;
        string comments;
    }

    // State variables
    JoyToken public joyToken;
    uint256 public validationsRequired;
    uint256 public submissionFee;
    uint256 public validationReward;
    
    mapping(uint256 => Dataset) public datasets;
    uint256 public datasetCount;

    // Events
    event DatasetSubmitted(uint256 indexed datasetId, address indexed submitter, string ipfsHash);
    event DatasetValidated(uint256 indexed datasetId, address indexed validator, bool approved);
    event DatasetStatusUpdated(uint256 indexed datasetId, DatasetStatus newStatus);
    event ValidationParametersUpdated(uint256 validationsRequired, uint256 submissionFee, uint256 validationReward);

    constructor(
        address _joyToken,
        uint256 _validationsRequired,
        uint256 _submissionFee,
        uint256 _validationReward
    ) {
        joyToken = JoyToken(_joyToken);
        validationsRequired = _validationsRequired;
        submissionFee = _submissionFee;
        validationReward = _validationReward;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(CURATOR_ROLE, msg.sender);
    }

    /**
     * @dev Submit a new dataset for validation
     * @param ipfsHash IPFS hash of the dataset
     * @param size Size of the dataset in bytes
     * @param dataType Type of data in the dataset
     */
    function submitDataset(
        string calldata ipfsHash,
        uint256 size,
        string calldata dataType
    ) external whenNotPaused nonReentrant {
        require(bytes(ipfsHash).length > 0, "Invalid IPFS hash");
        require(size > 0, "Invalid dataset size");
        require(bytes(dataType).length > 0, "Invalid data type");

        // Collect submission fee
        require(
            joyToken.transferFrom(msg.sender, address(this), submissionFee),
            "Fee transfer failed"
        );

        uint256 datasetId = datasetCount++;
        Dataset storage newDataset = datasets[datasetId];
        newDataset.submitter = msg.sender;
        newDataset.ipfsHash = ipfsHash;
        newDataset.status = DatasetStatus.Pending;
        newDataset.submissionTime = block.timestamp;
        newDataset.size = size;
        newDataset.dataType = dataType;
        newDataset.validations = 0;

        emit DatasetSubmitted(datasetId, msg.sender, ipfsHash);
    }

    /**
     * @dev Validate a submitted dataset
     * @param datasetId ID of the dataset to validate
     * @param approved Whether the validator approves the dataset
     * @param comments Validation comments
     */
    function validateDataset(
        uint256 datasetId,
        bool approved,
        string calldata comments
    ) external whenNotPaused nonReentrant {
        require(hasRole(VALIDATOR_ROLE, msg.sender), "Must be validator");
        require(datasetId < datasetCount, "Invalid dataset ID");
        require(!datasets[datasetId].hasValidated[msg.sender], "Already validated");
        require(datasets[datasetId].status == DatasetStatus.Pending, "Not pending");

        Dataset storage dataset = datasets[datasetId];
        dataset.hasValidated[msg.sender] = true;
        dataset.validationVotes[msg.sender] = ValidationVote({
            hasVoted: true,
            approved: approved,
            comments: comments
        });
        dataset.validations++;

        emit DatasetValidated(datasetId, msg.sender, approved);

        // Reward validator
        joyToken.transfer(msg.sender, validationReward);

        // Update dataset status if enough validations
        if (dataset.validations >= validationsRequired) {
            uint256 approvalCount = 0;
            address[] memory validators = getValidators();
            
            for (uint256 i = 0; i < validators.length; i++) {
                if (dataset.validationVotes[validators[i]].approved) {
                    approvalCount++;
                }
            }

            // Update status based on majority approval
            if (approvalCount > validators.length / 2) {
                dataset.status = DatasetStatus.Approved;
            } else {
                dataset.status = DatasetStatus.Rejected;
            }

            emit DatasetStatusUpdated(datasetId, dataset.status);
        }
    }

    /**
     * @dev Update validation parameters
     * @param _validationsRequired New number of validations required
     * @param _submissionFee New submission fee
     * @param _validationReward New validation reward
     */
    function updateValidationParameters(
        uint256 _validationsRequired,
        uint256 _submissionFee,
        uint256 _validationReward
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        validationsRequired = _validationsRequired;
        submissionFee = _submissionFee;
        validationReward = _validationReward;

        emit ValidationParametersUpdated(_validationsRequired, _submissionFee, _validationReward);
    }

    /**
     * @dev Get all validators
     * @return Array of validator addresses
     */
    function getValidators() public view returns (address[] memory) {
        uint256 validatorCount = 0;
        uint256 totalRoleMembers = getRoleMemberCount(VALIDATOR_ROLE);
        address[] memory validators = new address[](totalRoleMembers);

        for (uint256 i = 0; i < totalRoleMembers; i++) {
            address validator = getRoleMember(VALIDATOR_ROLE, i);
            validators[validatorCount++] = validator;
        }

        return validators;
    }

    // Emergency functions
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
