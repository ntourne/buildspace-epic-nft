import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from './artifacts/MyEpicNFT.json';

const CONTRACT_ADDRESS = "0x8ae260fdF8E5ffE7A31F756f93Dd88FD4d110c82";

// Constants
const TWITTER_HANDLE = 'nicotourne';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-1qmid2ej0z';

const App = () => {

  /*
   * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [mining, setMining] = useState(false);
  const [transactionUrl, setTransactionUrl] = useState("");
  const [totalMinted, setTotalMinted] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [correctNetwork, setCorrectNetwork] = useState(false);

  const checkIfWalletIsConnected = async () => {

    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    /*
    * Check if we're authorized to access the user's wallet
    */
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    /*
     * User can have multiple authorized accounts, we grab the first one if its there!
     */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)

      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum && correctNetwork) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });


        connectedContract.totalMinted()
          .then((data) => {
            console.log('totalMinted');
            console.log(data);
            if (data)
              setTotalMinted(data.toNumber());
          })

        connectedContract.totalSupply()
          .then((data) => {
            console.log('totalSupply');
            console.log(data);
            if (data)
              setTotalSupply(data.toNumber());
          })


        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  /*
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }


      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        setMining(true);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();

        setMining(false);

        setTransactionUrl(`https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  const checkCorrectNetwork = async () => {
    const { ethereum } = window;
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
      setCorrectNetwork(false);
    }
    else
      setCorrectNetwork(true);
  }

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
    checkCorrectNetwork();
  }, [])


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {correctNetwork && (
            <>
              {currentAccount === "" ? (
                <button onClick={connectWallet} className="cta-button connect-wallet-button">
                  Connect to Wallet
                </button>
              ) : (
                <button onClick={askContractToMintNft} className="cta-button connect-wallet-button"
                  disabled={mining}>
                  {mining ? 'Minting NFT...' : 'Mint NFT'}
                </button>
              )}

              {totalMinted && totalSupply && <p className="sub-text">
                {totalMinted}/{totalSupply} NFTs minted so far
              </p>}
            </>
          )}

          {!correctNetwork && <p className="sub-text">** You are in a wrong network. Please, switch to Rinkeby **</p>}
        </div>
        <div>
          {transactionUrl && <a
            className="footer-text"
            href={transactionUrl}
            target="_blank"
            rel="noreferrer"
          >See transaction URL in rinkeby.etherscan.io</a>}
        </div>
        <div>
          🌊 <a className="footer-text" href={OPENSEA_LINK} target="_blank" rel="noreferrer">View Collection on OpenSea</a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
