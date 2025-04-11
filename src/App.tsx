import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Account } from './accounting/Account';
import BalanceSheet from './accounting/BalanceSheet';

const App: React.FC = () => {
    const [accounts, setAccounts] = useState<Array<{ name: string; value: number }>>([
        { name: 'Cash', value: 100 },
    ]);

    const addAccount = () => {
        setAccounts([...accounts, { name: 'New Account', value: 0 }]);
    };

    return (
        <div className="App">
            <header className="App-header">
                {accounts.map((account, index) => (
                    <Account
                        key={index}
                        initialName={account.name}
                        initialValue={account.value}
                    />
                ))}
                <button onClick={addAccount}>Add Account</button>
                <BalanceSheet />

                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;



