// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AIModelMarketplace {
    struct Model {
        string id;
        uint256 price;
        address owner;
        bool isListed;
    }
    
    mapping(string => Model) public models;
    mapping(string => address) public modelPurchasers;

    event ModelListed(string modelId, uint256 price, address owner);
    event ModelPurchased(string modelId, address purchaser);

    function listModel(string memory modelId, uint256 price) public {
        require(bytes(modelId).length > 0, "Invalid model ID");
        require(price > 0, "Price must be greater than 0");
        require(!models[modelId].isListed, "Model already listed");

        models[modelId] = Model({
            id: modelId,
            price: price,
            owner: msg.sender,
            isListed: true
        });

        emit ModelListed(modelId, price, msg.sender);
    }

    function purchaseModel(string memory modelId) public payable {
        Model storage model = models[modelId];
        require(model.isListed, "Model not listed");
        require(msg.value >= model.price, "Insufficient payment");

        modelPurchasers[modelId] = msg.sender;
        payable(model.owner).transfer(msg.value);

        emit ModelPurchased(modelId, msg.sender);
    }

    function getModel(string memory modelId) public view returns (Model memory) {
        return models[modelId];
    }

    function getModelPurchaser(string memory modelId) public view returns (address) {
        return modelPurchasers[modelId];
    }
}