// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AITrainingRewards {
    uint256 private rewardRate;
    mapping(address => uint256) private trainingTime;

    event RewardRateSet(uint256 rate);
    event TrainingSessionRecorded(address trainer, uint256 duration);

    function setRewardRate(uint256 rate) public {
        rewardRate = rate;
        emit RewardRateSet(rate);
    }

    function getRewardRate() public view returns (uint256) {
        return rewardRate;
    }

    function calculateReward(uint256 duration) public view returns (uint256) {
        return rewardRate * duration;
    }

    function recordTrainingSession(address trainer, uint256 duration) public {
        trainingTime[trainer] += duration;
        emit TrainingSessionRecorded(trainer, duration);
    }

    function getTrainingTime(address trainer) public view returns (uint256) {
        return trainingTime[trainer];
    }
}