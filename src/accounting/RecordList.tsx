import React, { useState, useEffect } from 'react';
import { Account } from './Account';

interface AccountType {
    name: string;
    value: number;
}

interface RecordListProps {
    title: string;
    accounts: AccountType[];
    setAccounts: React.Dispatch<React.SetStateAction<AccountType[]>>;
    editMode?: boolean;
    setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
    knownNames?: string[];
    customHeader?: React.ReactNode;
}

const RecordList: React.FC<RecordListProps> = ({
    title,
    accounts,
    setAccounts,
    editMode = false,
    setEditMode,
    knownNames = [],
    customHeader,
}) => {
    const total = accounts.reduce((sum, account) => sum + account.value, 0);

    const itemsToRender = editMode && knownNames.length > 0
        ? knownNames
        : accounts.map(a => a.name);

    const [newAccountName, setNewAccountName] = React.useState('');
    const [newAccountValue, setNewAccountValue] = React.useState('');
    const [hoveringAdd, setHoveringAdd] = useState(false);
    const [hoveringEdit, setHoveringEdit] = useState(false);
    // const [editMode, setEditMode] = useState(false);
    const [addMode, setAddMode] = useState(false);

    const accountNameInputRef = React.useRef<HTMLInputElement>(null);
    const accountValueInputRef = React.useRef<HTMLInputElement>(null);

    // Focuses the asset name input when add mode is activated
    useEffect(() => {
        if (addMode && accountNameInputRef.current) {
            accountNameInputRef.current.focus();
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

    const addAccount = (accountName: string, accountValue: number) => {
        setAccounts([...accounts, { name: accountName, value: accountValue }]);
    };

    const handleAddClick = () => {
        addAccount(newAccountName || 'Unnamed', Number(newAccountValue) || 0);
        setNewAccountName('');
        setNewAccountValue('');
    };

    const suggestions = knownNames.filter(account =>
        account.toLowerCase().startsWith(newAccountName.toLowerCase()) &&
            newAccountName.trim() !== ''
    );

    return (
        <div className="record-list">

            <div className="record-list-header">
                <button className="edit-mode-button" onClick={() => setEditMode(!editMode)}
                    onMouseEnter={() => setHoveringEdit(true)}
                    onMouseLeave={() => setHoveringEdit(false)}>
                    <img src="/edit-icon.png" alt="Edit Mode" className="edit-mode-button-icon"/>
                </button>
                {customHeader ? customHeader : <p>{hoveringAdd ? `Add ${title}?` : hoveringEdit ? `Edit ${title}?` : title}</p>}
                <button className="add-button" onClick={() => setAddMode(!addMode)}
                    onMouseEnter={() => setHoveringAdd(true)}
                    onMouseLeave={() => setHoveringAdd(false)}
                >+</button>
            </div>
            {itemsToRender.map((name, index) => {
                const match = accounts.find(a => a.name === name);
                const value = match?.value ?? 0;

                return (
                    <Account
                        key={index}
                        initialName={name}
                        initialValue={value}
                        isSet={value !== 0}
                    />
                );
            })}
            {addMode ?
                <div className="input-account">
                    <div className="input-wrapper">
                        <input
                            ref={accountNameInputRef}
                            className="input-account-name"
                            type="text"
                            placeholder="Asset Name"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            onKeyDown={(e) => {
                                if ((e.key === 'Enter') && accountValueInputRef.current) {
                                    accountValueInputRef.current.focus();
                                }
                            }}
                        />
                        {suggestions.length > 0 && (
                            <ul className="suggestions">
                                {suggestions.map((suggestion, i) => (
                                    <li className="record"
                                        key={i}
                                        onClick={() => setNewAccountName(suggestion)}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <input
                        ref={accountValueInputRef}
                        className="input-account-amount"
                        type="number"
                        placeholder="Amount"
                        value={newAccountValue}
                        onChange={(e) => setNewAccountValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddClick();
                                accountNameInputRef.current?.focus();
                            }
                        }}
                    />
                    <button className="input-account-button" onClick={handleAddClick}>Add</button>
                </div>
                : null}


            <div className="record-total">
                <strong>Total {title}:</strong> ${total.toFixed(2)}
            </div>
        </div>
    );
};

export default RecordList;

