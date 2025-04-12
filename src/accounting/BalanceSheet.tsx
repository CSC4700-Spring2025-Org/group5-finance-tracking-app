import React, { useState, useEffect } from 'react';
import { Account, Asset, Liability } from './Account';
import RecordList from './RecordList';

const BalanceSheet = () => {
    const KNOWN_ASSETS = ['Cash', 'Accounts Receivable', 'Property', 'Investments', 'Inventory'];

    const [newAssetName, setNewAssetName] = useState('');
    const [newAssetAmount, setNewAssetAmount] = useState('');
    const [newLiabilityName, setNewLiabilityName] = useState('');
    const [newLiabilityAmount, setNewLiabilityAmount] = useState('');

    const assetNameInputRef = React.useRef<HTMLInputElement>(null);
    const assetAmountInputRef = React.useRef<HTMLInputElement>(null);

    const [hoveringAdd, setHoveringAdd] = useState(false);
    const [hoveringEdit, setHoveringEdit] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [addMode, setAddMode] = useState(false);

    // Focuses the asset name input when add mode is activated
    useEffect(() => {
        if (addMode && assetNameInputRef.current) {
            assetNameInputRef.current.focus();
        }
    }, [addMode]);

    // Turns off add mode when 'Escape' key is pressed
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setAddMode(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);


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
                                    ref={assetNameInputRef}
                                    className="input-account-name"
                                    type="text"
                                    placeholder="Asset Name"
                                    value={newAssetName}
                                    onChange={(e) => setNewAssetName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter') && assetAmountInputRef.current) {
                                            assetAmountInputRef.current.focus();
                                        }
                                    }}
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
                                ref={assetAmountInputRef}
                                className="input-account-amount"
                                type="number"
                                placeholder="Amount"
                                value={newAssetAmount}
                                onChange={(e) => setNewAssetAmount(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddClick();
                                        assetNameInputRef.current?.focus();
                                    }
                                }}
                            />
                            <button className="input-account-button" onClick={handleAddClick}>Add</button>
                        </div>
                        : null}
                </div>
               <RecordList 
                    title="Assets"
                    accounts={accounts}
                    editMode={editMode}
                    knownNames={KNOWN_ASSETS}
                    setAccounts={setAccounts}
                    setEditMode={setEditMode}
            />

            </div>
        </div>

    )
}

export default BalanceSheet;
