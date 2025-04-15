import React, { useState, useEffect } from 'react';
import { iAccount, iAsset, iLiability } from './types';
import './accounting.css';

export const Account: React.FC<{ initialName: string; initialValue: number, isSet: boolean }> = ({ initialName, initialValue, isSet }) => {
    const [name, setName] = useState(initialName);
    const [value, setValue] = useState(initialValue);

    const record = () => (
        <div className="record">
            <div>{name}</div>
            <div>{isSet ? value : '?'}</div>
        </div>
    );

    return record();
};

export function useAccount(initialValue: number, initialName: string, initialIsSet: boolean = false) {
    const [name, setName] = useState(initialName);
    const [value, setValue] = useState(initialValue);
    const [isSet, setIsSet] = useState(initialIsSet);

    const record = () => (
        <div className="record">
            <div>{name}</div>
            <div>{isSet ? value : '?'}</div>
        </div>
    );

    return { name, setName, value, setValue, record, isSet, setIsSet };
}

type Props = {
    initialName: string;
    initialValue: number;
    initialIsSet: boolean;
    editMode: boolean;
    onChange?: (value: number) => void;
};

export const AccountComponent: React.FC<Props> = ({ initialName, initialValue, initialIsSet, editMode, onChange }) => {
    const { name, setName, value, setValue, record, isSet, setIsSet } = useAccount(initialValue, initialName, initialIsSet);

    const [hovering, setHovering] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        setValue(initialValue); 
        setCurrentValue(initialValue);
    }, [initialValue]);

    return (
        <div className={editMode ? "record editable-record" : "record"}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => {
                setHovering(false)
                setConfirmed(false)
            }}
        >
            <div>
                {editMode ? (
                    name
                ) : (
                        name
                    )}
            </div>
            {(isEditing || hovering) && editMode && !confirmed ? (
                <div className="input-wrapper">
                    <input
                        type="number"
                        value={currentValue}
                        onChange={(e) => {
                            if (e.target.value[0] === '0') e.target.value = e.target.value.slice(1);
                            setCurrentValue(Number(e.target.value))}
                        }
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setIsSet(true);
                                setValue(Number(currentValue));
                                setIsEditing(false);
                                setConfirmed(true);
                                onChange?.(currentValue);
                            }
                        }}
                        onFocus={() => setIsEditing(true)}
                        onBlur={() => {
                            setCurrentValue(value);
                            setIsEditing(false)
                        }}
                    />
                    
                </div>
            ) : (
                    <div>
                        {isSet ? value : '?'}
                    </div>
                )}
        </div>
    );
};

export const Asset: React.FC<{ initialName: string; initialValue: number, isSet: boolean }> = ({ initialName, initialValue, isSet }) => {
    return <Account initialName={initialName} initialValue={initialValue} isSet={isSet}/>
};

export const Liability: React.FC<{ initialName: string; initialValue: number, isSet: boolean }> = ({ initialName, initialValue, isSet }) => {
    return <Account initialName={initialName} initialValue={initialValue} isSet={isSet}/>
};
