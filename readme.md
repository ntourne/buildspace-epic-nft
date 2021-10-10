## Buildspace - "Mint your own NFT collection and ship a Web3 app to show them off"

This repository host the source code of a NFT project created at [Buildspace](https://buildspace.so/) platform.

### Getting started

**Contracts**

Install all dependencies:

```
cd contracts
npm install
```

You need to create a new app at You need to create a new app at [Alchamy](https://www.alchemy.com/).

Create a `.env` file to host the following:

```
STAGING_ALCHEMY_KEY=<ALCHAMY_API_URL>
PRIVATE_KEY=<PRIVATE_KEY>
```

Use the Rinkeby network. So, you need to grab some ETH which will be needed to deploy your smart contract and mint some NFTs.

**Web**

Install dependencies:

```
cd web
npm install
```

Start your app at [http://localhost:3000](http://localhost:3000).

```
npm start
```

**Note**

There're extra steps you need to follow to set up everything. So, I recommend you do the course 🙂
