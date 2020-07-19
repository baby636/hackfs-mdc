// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;

import './Content.sol';
import './lib/OpenZeppelin/SafeMath.sol';

contract Publisher {
    using SafeMath for uint;

    struct publisherProfile{
        address id;
        string name;
        string email;
        string logo;
        address[] subscribers;
        uint subscriptionCost;
        uint balance;
    }

    mapping(address => uint) subscriberTimestamp;
    mapping(address => address[]) contentContracts;
    mapping(address => publisherProfile) public profile;

    /**
     * @notice Update the publishers Profile
     * @param _name Publisher's Name
     * @param _email Publisher's Email
     * @param _logo Publisher's Logo
     */
    function updatePublisherProfile(string memory _name, string  memory _email, string memory _logo, uint _subscriptionCost) public {
        profile[msg.sender].name = _name;
        profile[msg.sender].email = _email;
        profile[msg.sender].logo = _logo;
        profile[msg.sender].subscriptionCost = _subscriptionCost;
    }

    /**
     * @notice Get the content contracts of a Publisher
     * @param _publisher Publisher's address
     * @return All the content contracts associated with the Publisher
     */
    function getContentContracts(address _publisher) public view returns (address[] memory){
        return contentContracts[_publisher];
    }

    /**
     * @notice Fetch a publishers subscribers
     * @param _publisher Publisher's address
     * @return All the subscibers addresses
     */
    function getSubscribers(address _publisher) public view returns (address[] memory){
        return contentContracts[_publisher].subscibers;
    }

    // add timestamp?
    /**
     * @notice Add a subscriber to the publisher
     * @param _publisher Publisher's address
     * @return All the content contracts associated with the Publisher
     */
    function addSubscriber(address _publisher, address _subscriber, uint _amount) public payable {
        require(_amount == profile[_publisher].subscriptionCost, 'Amount sent is less than the publishers subscription cost.');
        profile[_publisher].balance += msg.value;
        profile[_publisher].subscribers.push(_subscriber);
        subscriberTimestamp[_subscriber] = now;

        for (uint i = 0; i <= contentContracts[_publisher].length; i++) {
            Content(contentContracts[_publisher][i]).whiteList(_subscriber);
        }
    }

    function withdrawEarnings(address _publisher, address payable _to, uint _amount) public {
        require(msg.sender == profile[_publisher].id, 'You are unauthorized to withdraw funds from this publishers account');
        require(_amount <= profile[_publisher].balance, 'The amount you are trying to withdraw exceeds your subscription earnings');
        profile[_publisher].balance = profile[_publisher].balance.sub(_amount);
        _to.transfer(_amount);
    }

    ////// ******* Here we start to write functions that interact with the Content.sol ******* //////
    ////// ******* Here we start to write functions that interact with the Content.sol ******* //////
    ////// ******* Here we start to write functions that interact with the Content.sol ******* //////

    /**
     * @notice Create a new Content Contract
     * @param _contentHash The hash of the content (IPFS / FIlecoin)
     * @param _name Content title
     * @param _accessType Free or Paid (pay-as-you-go / Subscription)
     */
    function createContent(string memory _contentHash, string memory _name, string memory _accessType, uint _price) public {
        Content contractId = new Content(_contentHash, _name, _accessType, _price, _subscribers);
        contentContracts[msg.sender].push(address(contractId));
    }

    /**
     * @notice Fetches Content Contract information
     * @param _contract Content Contract address
     * @return All the content contracts associated with the Publisher
     * @return All the content contracts associated with the Publisher
     */
    function getContentInformation(address _contract) public view returns (string memory, string memory, uint, string memory) {
        return Content(_contract).getContentDetails();
    }

    function getFile(address _contract) public view returns (string memory) {
        return Content(_contract).getFile();
    }

    function purchaseContent(address _consumer, address _payor, uint256 _amount) public returns (bool) {
        return Content(_contract).purchaseContent(_consumer, _amount);
    }
}
