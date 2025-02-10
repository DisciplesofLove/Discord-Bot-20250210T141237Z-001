// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDatasetGovernance {
    enum DatasetStatus { Pending, Approved, Rejected }

    function submitDataset(
        string calldata ipfsHash,
        uint256 size,
        string calldata dataType
    ) external;

    function validateDataset(
        uint256 datasetId,
        bool approved,
        string calldata comments
    ) external;

    function getValidators() external view returns (address[] memory);
}
