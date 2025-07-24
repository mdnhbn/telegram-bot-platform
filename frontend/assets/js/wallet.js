// frontend/assets/js/wallet.js

const wallet = {
    tgUser: null,

    init: function() {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.ready();
            this.tgUser = Telegram.WebApp.initDataUnsafe.user;
        } else {
            console.warn("Not in Telegram. Using mock user.");
            this.tgUser = { id: '12345' };
        }
        
        this.fetchWalletData();
        this.addEventListeners();
    },

    addEventListeners: function() {
        document.getElementById('depositBtn').addEventListener('click', () => this.showDepositModal());
        document.getElementById('withdrawBtn').addEventListener('click', () => this.showWithdrawModal());
        document.getElementById('transferBtn').addEventListener('click', () => this.showTransferModal());
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    },

    fetchWalletData: function() {
        const loader = document.getElementById('loader');
        const walletContent = document.getElementById('walletContent');

        api.post('/wallet/summary', { userId: this.tgUser.id })
            .then(response => {
                this.renderWallet(response.data);
                loader.style.display = 'none';
                walletContent.style.display = 'block';
            })
            .catch(error => {
                console.error("Failed to fetch wallet data:", error);
                loader.innerHTML = '<p style="text-align:center;color:var(--error-color);">Failed to load wallet. Please refresh.</p>';
            });
    },

    renderWallet: function(data) {
        document.getElementById('balanceValue').textContent = Math.floor(data.balance);
        const historyList = document.getElementById('transactionHistory');
        historyList.innerHTML = '';

        if (data.transactions.length === 0) {
            historyList.innerHTML = '<p style="text-align:center;color:var(--text-muted-color);">No transactions yet.</p>';
            return;
        }

        data.transactions.forEach(tx => {
            const li = document.createElement('li');
            li.className = `transaction-item ${tx.type}`; // earn, withdraw, transfer, deposit
            const isCredit = ['earn', 'deposit', 'received'].includes(tx.type);

            const iconMap = {
                earn: 'fa-tasks',
                withdraw: 'fa-arrow-up',
                transfer: 'fa-exchange-alt',
                deposit: 'fa-arrow-down',
                received: 'fa-gift'
            };

            li.innerHTML = `
                <div class="transaction-icon"><i class="fas ${iconMap[tx.type] || 'fa-dollar-sign'}"></i></div>
                <div class="transaction-details">
                    <div class="description">${tx.description}</div>
                    <div class="date">${new Date(tx.date).toLocaleString()}</div>
                </div>
                <div class="transaction-amount ${isCredit ? 'credit' : 'debit'}">
                    ${isCredit ? '+' : '-'}${Math.floor(tx.amount)}
                </div>
            `;
            historyList.appendChild(li);
        });
    },
    
    // --- Modal Functions ---
    showDepositModal: function() {
        this.openModal('Deposit Points', `
            <p>To deposit, please send crypto to the address below and submit the transaction ID.</p>
            <div class="card" style="background: var(--background-color); text-align: left;">
                <strong>USDT (TRC20) Address:</strong>
                <p style="word-wrap: break-word; font-family: monospace; color: var(--primary-color);">YOUR_WALLET_ADDRESS_HERE</p>
            </div>
            <input type="text" id="txIdInput" placeholder="Enter Transaction ID (TxID)">
            <button class="action-button" onclick="wallet.handleDeposit()">Submit for Verification</button>
        `);
    },
    
    showWithdrawModal: function() {
         api.post('/wallet/withdraw-info', { userId: this.tgUser.id })
            .then(res => {
                const { minWithdraw, userAddress } = res.data;
                this.openModal('Withdraw Points', `
                    <input type="text" id="withdrawAddressInput" placeholder="Your USDT (TRC20) Address" value="${userAddress || ''}">
                    <input type="number" id="withdrawAmountInput" placeholder="Amount to withdraw">
                    <div class="info-text">
                        Minimum withdrawal: ${minWithdraw} points. <br>
                        A small network fee may apply.
                    </div>
                    <button class="action-button" onclick="wallet.handleWithdraw()">Request Withdrawal</button>
                `);
            });
    },

    showTransferModal: function() {
        this.openModal('Transfer Points', `
            <input type="text" id="recipientIdInput" placeholder="Recipient's User ID or Username">
            <input type="number" id="transferAmountInput" placeholder="Amount to transfer">
             <div class="info-text" id="transferFeeInfo"></div>
            <button class="action-button" onclick="wallet.handleTransfer()">Transfer Points</button>
        `);
        // Add event listener to show fee dynamically
        document.getElementById('transferAmountInput').addEventListener('input', (e) => {
            // This fee should come from backend settings in a real app
            const fee = 0.05; // 5%
            const amount = parseFloat(e.target.value) || 0;
            const feeAmount = Math.ceil(amount * fee);
            document.getElementById('transferFeeInfo').textContent = `Fee: ${feeAmount} points. Recipient will get: ${amount - feeAmount} points.`;
        });
    },

    handleDeposit: function() { alert("Deposit submitted for verification!"); this.closeModal(); /* API call here */ },
    handleWithdraw: function() { alert("Withdrawal request sent!"); this.closeModal(); /* API call here */ },
    handleTransfer: function() { alert("Points transferred successfully!"); this.closeModal(); /* API call here */ },

    openModal: function(title, bodyHtml) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = bodyHtml;
        document.getElementById('walletModal').classList.add('active');
    },

    closeModal: function() {
        document.getElementById('walletModal').classList.remove('active');
    }
};
