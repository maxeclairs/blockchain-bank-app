// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.4;

contract Bank {
    address public bankOwner;
    string public bankName;
    mapping(address => uint256) public customerBalance;

    //add constructor
    constructor(){
        bankOwner = msg.sender;
    }

    // add function to change bank name
    function changeBankName(string memory _newBankName) external{
        require(
            msg.sender == bankOwner, 
            "You are not the owner of this bank!"
            );
        bankName = _newBankName;
    }

    // add function to deposit money
    function depositMoney() public payable{
        require(
            msg.value != 0, 
            "You must deposit some money!"
            );
        customerBalance[msg.sender] += msg.value;
    }
   

    // function to withdraw money
    function withdrawMoney(address payable _to, uint256 _total) public payable{
        require(
            _total <= customerBalance[msg.sender], 
            "You don't have enough money!"
            );
        _to.transfer(_total);
        customerBalance[msg.sender] -= _total;
    }

    // get customer balance
    function getCustomerBalance() external view returns (uint256){
        return customerBalance[msg.sender];
    }

    // get bank balance
    function getBankBalance() public view returns (uint256){
        require(
            msg.sender == bankOwner, 
            "You are not the owner of this bank!"
            );
        return address(this).balance;
    }
}