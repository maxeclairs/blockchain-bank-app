//import usestate and useeffect
import React, { useState, useEffect } from 'react';

// import ethers, utils from ethers
import { ethers, utils } from 'ethers';

//import ABI from contract
import abi from './contracts/Bank.json';

function App(){
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isBankOwner, setIsBankOwner] = useState(false);
  const [inputValue, setInputValue] = useState({withdraw:"", deposit: "", bankName: ""});
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null);
  const [currentBankName, setCurrentBankName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);
  const [txnStatus, setTxnStatus] = useState(null);

  const contractAddress = '0xa1317587f5115A27537e0bD7BDDE474E9B4c2fB1';
  const contractABI = abi.abi;

  const setTransactionStatus = (status) => {
    setTxnStatus(status);
  }

  const checkIfWalletIsConnected = async () => {
    try {
      if(window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setCustomerAddress(account);
        setIsWalletConnected(true);
        console.log("Wallet is connected: ", account);

      }else{
        setError("Please install MetaMask wallet");
        console.log("No MetaMask wallet detected");
      }
    } catch(error) {
      console.log(error)
    }
  }

  // get bank name
  const getBankName = async () => {
    try {
      if(window.ethereum) {
        //get provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        //get contract
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        //get bank name
        let bankName = await bankContract.bankName();
        bankName = utils.parseBytes32String(bankName);
        setCurrentBankName(bankName.toString());
        console.log("Bank name: ", bankName);       

      } else {
        setError("Please install MetaMask wallet");
        console.log("No MetaMask wallet detected");

      }
    } catch(error) {
      console.log(error);
    }
  }

  // set bank name
  const setBankName = async (event) => {
    // prevent default
    event.preventDefault();
    try {
      if(window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        //set bank name
        const txn = await bankContract.changeBankName(utils.formatBytes32String(inputValue.bankName));
        console.log("Setting Bank name...");
        setTransactionStatus("Setting Bank name...");
        await txn.wait();
        console.log("Bank name changed");
        setTransactionStatus("Bank name changed successfully!");
        getBankName();
        // reset input value
        setInputValue({...inputValue, bankName: ""});
        
        
      } else {
        setError("Please install MetaMask wallet");
        console.log("No MetaMask wallet detected");
      }
    } catch(error) {
      console.log(error);
    }
  }

  // get bank owner
  const getBankOwner = async () => {
    try {
      if(window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        const bankOwner = await bankContract.bankOwner();
        // bankOwner = utils.parseBytes32String(bankOwner);
        setBankOwnerAddress(bankOwner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if(bankOwner.toLowerCase() === account.toLowerCase()){
          setIsBankOwner(true);
          console.log("You are the bank owner");
        } else {
          console.log("You are not the bank owner");
        }
      } else {
        setError("Please install MetaMask wallet");
        console.log("No MetaMask wallet detected");
      }
    } catch(error) {
      console.log(error);
    }
  }

  // customer balance 
  const customerBalanceHandler = async () => {
    try {
      // check if ethereum object is present
      if(window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        // get customer balance
        const customerBalance = await bankContract.getCustomerBalance();
        setCustomerTotalBalance(utils.formatEther(customerBalance));
        console.log("Customer balance: ", customerBalance);

      } else {
        setError("Please install MetaMask wallet");
        console.log("No MetaMask wallet detected");
      }
    } catch(error) {
      console.log(error)

    }
  }

  // deposit money
  const depositMoney = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await bankContract.depositMoney({ value: ethers.utils.parseEther(inputValue.deposit) });

        console.log("Depositing money...");
        setTransactionStatus("Depositing ETH...");
        await txn.wait();
        console.log("ETH deposited to your bank account!");
        setTransactionStatus("ETH deposited to your bank account!");
        customerBalanceHandler();

        // reset input value
        setInputValue({...inputValue, deposit: ""});
      } else {
        setError("Please install MetaMask wallet");
        console.log("No MetaMask wallet detected");
      }
    } catch(error) {
      console.log(error);
    }
  }

  const withdrawMoney = async (event) => {
    try{
      event.preventDefault();
      if(window.ethereum){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        const myAddress = await signer.getAddress();

        const txn = await bankContract.withdrawMoney(myAddress, ethers.utils.parseEther(inputValue.withdraw));

        //change the button text
          
        console.log("Withdrawing money...");
        setTransactionStatus("Withdrawing ETH from your bank account...");
        await txn.wait()
        console.log("Money withdrawn");
        setTransactionStatus("ETH withdrawn from your bank account!");
        customerBalanceHandler();

        // reset input value
        setInputValue({...inputValue, withdraw: ""});
      }else{
        setError("Please install MetaMask wallet to withdraw money");
        console.log("No MetaMask wallet detected");
      }
    } catch(error){
      console.log(error);
    }
  }

  const handleInputChange = (event) => {
    setInputValue(inputValue => ({ ...inputValue, [event.target.name]: event.target.value }));
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getBankName();
    getBankOwner();
    customerBalanceHandler();
  }, [isWalletConnected])

  return(
    <main className="main-container">
      <div className="header">
       <h2><span className="headline-text">BlockChain Bank</span> <span className='money-image'>💰</span></h2>
      </div>
      <section className="section"> 
      {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className='bank-name'>
          {currentBankName === "" && isBankOwner ?
            <p>"Setup the name of your bank." </p> :
            <p>Welcome to {currentBankName} </p>

          }
        </div>
        <div className='section'>
          <form>
            <input type="text" onChange={handleInputChange} className='input-text'
              name="deposit" placeholder='0.0000 ETH'
              value={inputValue.deposit} />
            <button onClick={depositMoney}>Deposit ETH</button>
          </form>
        </div>
        <div className='section'>
          <form>
            <input type="text" onChange={handleInputChange} className='input-text'
              name="withdraw" placeholder='0.0000 ETH'
              value={inputValue.withdraw} />
            <button onClick={withdrawMoney}>Withdraw ETH</button>
          </form>
          <div>
            <p className='status-text'>Status: {txnStatus}</p>
          </div>
        </div>
        <div className="">
          <p><span className="wallet-text">Customer Balance: </span>{customerTotalBalance} ETH</p>
        </div>
        <div className="">
          <p><span className="wallet-text">Bank Owner Address: </span>{bankOwnerAddress}</p>
        </div>
        <div className="section">
          {isWalletConnected && <p ><span className="wallet-text">Your Wallet Address: </span>{customerAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isBankOwner && (
          <section className="section">
            {/* <h3 className='header'>Admin Panel</h3> */}
            <hr />
            <form >
              <input type="text" placeholder="Enter a name for your Bank" className='input-text'
              onChange={handleInputChange}
              name="bankName"
              value={inputValue.bankName}
              />
              <button onClick={setBankName}>Set Bank Name</button>
            </form>
          </section>
        )
      }

    </main>
  )




}




export default App;
