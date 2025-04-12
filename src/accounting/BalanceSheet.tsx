import React, { useState, useEffect } from 'react';
import { Account, Asset, Liability } from './Account';
import RecordList from './RecordList';

const BalanceSheet = () => {
    const KNOWN_ASSETS = ['Cash', 'Accounts Receivable', 'Property', 'Investments', 'Inventory'];
    const KNOWN_LIABILITIES = ['Accounts Payable', 'Notes Payable', 'Accrued Liabilities', 'Long-term Debt'];

    const [editMode, setEditMode] = useState(false); // Edit will eventually apply to all portions. There will be one button.

    const [assets, setAssets] = useState<Array<{ name: string; value: number }>>([
        { name: 'Cash', value: 100 },
    ]);

    const [liabilities, setLiabilities] = useState<Array<{ name: string; value: number }>>([
        { name: 'Accounts Payable', value: 50 },
    ]);

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="financial-statement">
            <div className="fs-header">
                <h2>Balance Sheet as of {today}</h2>
            </div>
            <div style={{ display: "flex" }}>
                <RecordList 
                    title="Assets"
                    accounts={assets}
                    editMode={editMode}
                    knownNames={KNOWN_ASSETS}
                    setAccounts={setAssets}
                    setEditMode={setEditMode}
                />
                <RecordList 
                    title="Liabilities"
                    accounts={liabilities}
                    editMode={editMode}
                    knownNames={KNOWN_LIABILITIES}
                    setAccounts={setLiabilities}
                    setEditMode={setEditMode}      
                />
            </div>
        </div>

    )
}

export default BalanceSheet;
