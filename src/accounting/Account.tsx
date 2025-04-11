import React, { useState } from 'react';
import { iAccount, iAsset, iLiability } from './types';
import './accounting.css';

export const Account: React.FC<{ initialName: string; initialValue: number }> = ({ initialName, initialValue }) => {
    const [name, setName] = useState(initialName);
    const [value, setValue] = useState(initialValue);

    const record = () => (
        <div className="record">
            <div>{name}</div>
            <div>{value}</div>
            <button onClick={() => setValue(value + 10)}>+10</button>
        </div>
    );

    return record();
};

export function useAccount(initialValue: number, initialName: string) {
  const [name, setName] = useState(initialName);
  const [value, setValue] = useState(initialValue);

  const record = () => (
    <div>
      <div>{name}</div>
      <div>{value}</div>
    </div>
  );

  return { name, setName, value, setValue, record };
}

type Props = {
    initialName: string;
    initialValue: number;
};

export const AccountComponent: React.FC<Props> = ({ initialName, initialValue }) => {
    const { name, setName, value, setValue, record } = useAccount(initialValue, initialName);

    return (
        <div className="account">
            {record()}
            <button onClick={() => setValue(value + 10)}>+10</button>
        </div>
    );
};

// export const Asset = (initialValue: number = 0, initialName: string = 'Asset'): iAsset => {
// export function Asset(initialValue: number = 0, initialName: string = 'Asset'): iAccount {
export const Asset: React.FC<{ initialName: string; initialValue: number }> = ({ initialName, initialValue }) => {
    return <Account initialName={initialName} initialValue={initialValue} />
};

// export const Liability = (initialValue: number = 0, initialName: string = 'Liability'): iLiability => {
export const Liability: React.FC<{ initialName: string; initialValue: number }> = ({ initialName, initialValue }) => {
    return <Account initialName={initialName} initialValue={initialValue} />
};
