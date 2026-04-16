## 🌌 Nebula Finance: Decentralized Mutual Fund

Welcome to **Nebula Finance**, a premium decentralized application (DApp) designed to manage mutual funds with transparency and security. This guide is built for everyone, even if you have **zero knowledge** of coding or blockchain.

---
## Demo Image 

<img width="1919" height="976" alt="Screenshot 2026-04-17 035725" src="https://github.com/user-attachments/assets/0ba718d7-4e38-43a7-8dd2-cc815498a97c" />

# MetaMask Verification

<img width="523" height="761" alt="Screenshot 2026-04-17 043123" src="https://github.com/user-attachments/assets/5d0034ef-2fb2-474f-bd86-f8ea50edcb87" />

## 🚀 Quick Start Guide

Follow these steps in order to get the project running on your computer.

### 1. Prerequisites (The Setup)
Before starting, ensure you have the following installed:
*   **Node.js**: [Download here](https://nodejs.org/). (Choose the "LTS" version).
*   **MetaMask**: [Install the browser extension](https://metamask.io/). This is your digital wallet.

---

### 2. Installation
1.  **Download the Code**: Clone this repository or download the ZIP and extract it.
2.  **Open Terminal**: Open your command prompt (CMD), PowerShell, or Terminal.
3.  **Go to Folder**: Navigate to the project directory:
    ```bash
    cd "path/to/nebula-finance-folder"
    ```
4.  **Install Dependencies**: Run this command to install all the "engines" needed to run the app:
    ```bash
    npm install
    ```

---

### 3. Start the Local Blockchain
Since we aren't using real money yet, we need a "fake" local blockchain for testing.
1.  Open a **new** terminal window (keep the first one open).
2.  Run the following command:
    ```bash
    npm run node
    ```
    *This will start a local server and give you 20 accounts with 10,000 fake ETH each. **Keep this window running!***

---

### 4. Deploy the Smart Contracts
Now, we need to upload the "brains" (Smart Contracts) to our local blockchain.
1.  Go back to your **first** terminal window.
2.  Run:
    ```bash
    npm run deploy:local
    ```
    *This will deploy the Mutual Fund contracts and save the addresses locally.*

---

### 5. Start the Website
Finally, let's launch the user interface.
1.  In your terminal, run:
    ```bash
    npm run dev
    ```
2.  Open your browser and go to: [http://localhost:3000](http://localhost:3000)

---

### 🦊 6. Connect your MetaMask (Crucial Step)
To interact with the DApp, MetaMask needs to talk to your local blockchain:

1.  **Add Local Network**: 
    - Open MetaMask -> Click the Network selector (top left) -> **Add Network**.
    - Click **Add a network manually**.
    - **Network Name**: Hardhat Local
    - **RPC URL**: `http://127.0.0.1:8545`
    - **Chain ID**: `31337`
    - **Currency Symbol**: ETH
2.  **Import a Test Account**:
    - Go to the terminal where you ran `npm run node`.
    - Copy one of the **Private Keys** listed there.
    - In MetaMask, click the Profile Icon -> **Import Account**.
    - Paste the Private Key. You should now see 10,000 ETH!

---

## 🛠 Features
- **Glassmorphism UI**: A premium, modern design.
- **Mutual Fund Operations**: Deposit funds, track shares, and withdraw.
- **Secure**: Built with OpenZeppelin token standards.

## 📄 License
ISC License. Built with ❤️ for decentralized finance.
