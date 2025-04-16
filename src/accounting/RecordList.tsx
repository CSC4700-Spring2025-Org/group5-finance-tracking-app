import React, { useState, useEffect } from 'react';
import { Account, AccountComponent } from './Account';

type LiquidityType =
  | 'cash-equivalent'
  | 'short-term'
  | 'accounts-receivable'
  | 'inventory'
  | 'ppe'
  | 'long-term'
  | 'custom';

interface AccountType {
    name: string;
    value: number;
    liquidityType?: LiquidityType;
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

    const liquidityRank = {
        'cash-equivalent': 1,
        'short-term': 2, //marketable securities
        'accounts-receivable': 3,
        'inventory': 4,
        'ppe': 5,
        'long-term': 6, //intangible assets and deferred items
        'custom': 100
    };

    // Sort by liquidity rank, and then by name if liquidity is the same
    const sortedAccounts = accounts
    .sort((a, b) => {
        const liquidityA = a?.liquidityType && liquidityRank[a.liquidityType] !== undefined
            ? liquidityRank[a.liquidityType]
            : 10;
        const liquidityB = b?.liquidityType && liquidityRank[b.liquidityType] !== undefined
            ? liquidityRank[b.liquidityType]
            : 10;
        if (liquidityA === liquidityB) {
            return a.name.localeCompare(b.name);
        }
        return liquidityA - liquidityB;
    });

    const itemsToRender = editMode && knownNames.length > 0
         ? Array.from(new Set([...knownNames, ...sortedAccounts.map(a => a.name)]))
        .sort((a, b) => {
            const aVal = accounts.find(ac => ac.name === a)?.value ?? 0;
            const bVal = accounts.find(ac => ac.name === b)?.value ?? 0;
            if (aVal === 0 && bVal !== 0) return 1;
            if (aVal !== 0 && bVal === 0) return -1;
            return 0;
        })
        : accounts.map(a => a.name);

    const [newAccountName, setNewAccountName] = React.useState('');
    const [newAccountValue, setNewAccountValue] = React.useState('');
    const [hoveringAdd, setHoveringAdd] = useState(false);
    const [hoveringEdit, setHoveringEdit] = useState(false);
    const [addMode, setAddMode] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [editableIndex, setEditableIndex] = useState<number | null>(null);
    const [editableValue, setEditableValue] = useState<number>(0);

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
            if (e.key === 'Escape')
                setAddMode(false);
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
        <div className="record-list"
            onMouseLeave={() => setAddMode(false)}
            onKeyDown={(e) => {
                if (e.key === 'a') {
                    setAddMode(true);
                }
            }}

        >
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
                    <AccountComponent
                        key={name}
                        initialName={name}
                        initialValue={value}
                        initialIsSet={value !== 0}
                        editMode={editMode}
                        initialLiquidityType={match?.liquidityType || 'custom'}
                        onChange={(updatedValue) => {
                            setAccounts(prev => {
                                const index = prev.findIndex(a => a.name === name);
                                if (index !== -1) {
                                    const updated = [...prev];
                                    updated[index] = { ...updated[index], value: updatedValue };
                                    return updated;
                                } else {
                                    return [...prev, { name, value: updatedValue }];
                                }
                            });
                        }}
                    />
                );
            })}
            {addMode ?
                <div className="input-account">
                    <div className="input-wrapper">
                        <div className="ghost-input-wrapper">
                            <div className="ghost-text">
                                {suggestions.length > 0 &&
                                    suggestions[0].toLowerCase().startsWith(newAccountName.toLowerCase()) &&
                                    newAccountName !== '' ? (
                                        <>
                                            <span className="invisible-text">{newAccountName}</span>
                                            <span className="ghost-suggestion">
                                                {suggestions[0].slice(newAccountName.length)}
                                            </span>
                                        </>
                                    ) : null}
                            </div>
                            <input
                                ref={accountNameInputRef}
                                className="input-account-name"
                                type="text"
                                placeholder="Account Name"
                                value={newAccountName}
                                onChange={(e) => {
                                    setNewAccountName(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'ArrowDown') {
                                        setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
                                    } else if (e.key === 'ArrowUp') {
                                        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                                    } else if (e.key === 'Enter') {
                                        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length)
                                            setNewAccountName(suggestions[highlightedIndex]);
                                        setShowSuggestions(false);
                                        setHighlightedIndex(-1);
                                        accountValueInputRef.current?.focus();
                                    } else if (e.key === 'Tab') {
                                        if (suggestions.length > 0 && suggestions[0].toLowerCase().startsWith(newAccountName.toLowerCase())) {
                                            e.preventDefault();
                                            setNewAccountName(suggestions[0]);
                                            setShowSuggestions(false);
                                            accountValueInputRef.current?.focus();
                                        }
                                    }
                                }}
                            />
                        </div>
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="suggestions">
                                {suggestions.map((suggestion, i) => (
                                    <li 
                                        className={`record ${highlightedIndex === i ? 'highlighted' : ''}`}
                                        key={i}
                                        onClick={() => {
                                            setNewAccountName(suggestion);
                                            setHighlightedIndex(-1);
                                        }}
                                        onMouseEnter={() => setHighlightedIndex(i)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setNewAccountName(suggestion);
                                                setHighlightedIndex(-1);
                                            }
                                        }}
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
            <div className="record">
                <strong>Total {title}:</strong> ${total.toFixed(2)}
            </div>
        </div>
    );
};

export default RecordList;
