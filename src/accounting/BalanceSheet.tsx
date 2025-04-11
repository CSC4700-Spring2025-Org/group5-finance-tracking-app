import React, { useState, useEffect } from 'react';
import { Account, Asset, Liability } from './Account';

const BalanceSheet = () => {
    const KNOWN_ASSETS = ['Cash', 'Accounts Receivable', 'Property', 'Investments', 'Inventory'];

    const [newAssetName, setNewAssetName] = useState('');
    const [newAssetAmount, setNewAssetAmount] = useState('');
    const [newLiabilityName, setNewLiabilityName] = useState('');
    const [newLiabilityAmount, setNewLiabilityAmount] = useState('');

    const [hoveringAdd, setHoveringAdd] = useState(false);
    const [hoveringEdit, setHoveringEdit] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [addMode, setAddMode] = useState(false);

    const [accounts, setAccounts] = useState<Array<{ name: string; value: number }>>([
        { name: 'Cash', value: 100 },
    ]);

    const handleAddClick = () => {
        addAccount(newAssetName || 'Unnamed', Number(newAssetAmount) || 0);
        setNewAssetName('');
        setNewAssetAmount('');
    };

    const addAccount = (accountName: string, accountValue: number) => {
        setAccounts([...accounts, { name: accountName, value: accountValue }]);
    };

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const suggestions = KNOWN_ASSETS.filter(asset =>
        asset.toLowerCase().startsWith(newAssetName.toLowerCase()) &&
            newAssetName.trim() !== ''
    );

    return (
        <div className="financial-statement">
            <div className="fs-header">
                <h2>Balance Sheet as of {today}</h2>
            </div>
            <div style={{ display: "flex" }}>
                <div className="record-list">
                    <div className="record-list-header">
                        <button className="edit-mode-button" onClick={() => setEditMode(!editMode)}
                            onMouseEnter={() => setHoveringEdit(true)}
                            onMouseLeave={() => setHoveringEdit(false)}>
                            <img src="/edit-icon.png" alt="Edit Mode" className="edit-mode-button-icon"/>
                        </button>
                        <p>{hoveringAdd ? 'Add Asset?' : hoveringEdit ? 'Edit Assets?' : 'Assets'}</p>
                        <button className="add-button" onClick={() => setAddMode(!addMode)}
                            onMouseEnter={() => setHoveringAdd(true)}
                            onMouseLeave={() => setHoveringAdd(false)}
                        >+</button>
                    </div>
                    {(editMode ? KNOWN_ASSETS : accounts.map(a => a.name)).map((assetName, index) => {
                        const match = accounts.find(a => a.name === assetName);
                        const value = match ? match.value : 0;

                        return (

                            <Account
                                key={index}
                                initialValue={value}
                                initialName={assetName}
                                isSet={value !== 0}
                            />
                        )})}
                    {addMode ?
                        <div className="input-account">
                            <div className="input-wrapper">
                                <input
                                    className="input-account-name"
                                    type="text"
                                    placeholder="Asset Name"
                                    value={newAssetName}
                                    onChange={(e) => setNewAssetName(e.target.value)}
                                />
                                {suggestions.length > 0 && (
                                    <ul className="suggestions">
                                        {suggestions.map((suggestion, i) => (
                                            <li className="record"
                                                key={i}
                                                onClick={() => setNewAssetName(suggestion)}
                                            >
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <input
                                className="input-account-amount"
                                type="number"
                                placeholder="Amount"
                                value={newAssetAmount}
                                onChange={(e) => setNewAssetAmount(e.target.value)}
                            />
                            <button className="input-account-button" onClick={handleAddClick}>Add</button>
                        </div>


                        : null}
                </div>
                <div className="record-list">
                    <p className="record-list-header">Liabilities</p>
                </div>
            </div>
        </div>

    )
}

export default BalanceSheet;
