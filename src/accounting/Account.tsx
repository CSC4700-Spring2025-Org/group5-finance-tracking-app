import React, { useState } from 'react';
import { iAccount, iAsset, iLiability } from './types';
import './accounting.css';

// // export const Account = (initialValue: number = 0, initialName: string = 'Account'): iAccount => {
// export function Account(initialValue: number = 0, initialName: string = 'Account'): iAccount {
//     const [name, setName] = useState<string>(initialName);
//     const [value, setValue] = useState<number>(initialValue);
//
//     const record = () => (
//         <div className="record">
//             <div>{name}</div>
//             <div>{value}</div>
//         </div>
//     );
//
//     return {
//         name, setName,
//         value, setValue,
//         record,
//     }
// }
export const Account: React.FC<{ initialName: string; initialValue: number }> = ({ initialName, initialValue }) => {
  const [name, setName] = useState(initialName);
  const [value, setValue] = useState(initialValue);

  return (
    <div className="record">
      <div>{name}</div>
      <div>{value}</div>
      <button onClick={() => setValue(value + 10)}>+10</button>
    </div>
  );
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

// // export const Asset = (initialValue: number = 0, initialName: string = 'Asset'): iAsset => {
// export function Asset(initialValue: number = 0, initialName: string = 'Asset'): iAccount {
//     return {
//         ...Account(initialValue, initialName)
//     }
// }
//
// export const Liability = (initialValue: number = 0, initialName: string = 'Liability'): iLiability => {
//     return {
//         ...Account(initialValue, initialName)
//     }
// }
interface AccountProps {
  initialRecords: Array<iAccount>
}

// export const RecordList: React.FC = () => {
//     const [records, setRecords] = useState<Array<iAccount>>([]);
//     const addRecord = (record: iAccount) => {
//         setRecords([...records, record]);
//         return records;
//     }
//     const [newAssetName, setNewAssetName] = useState('');
//     const [newAssetAmount, setNewAssetAmount] = useState('');
//     const addInputField = (
//             <div className="input-account">
//                 <input
//                     className="input-account-name"
//                     type="text"
//                     placeholder="Asset Name"
//                     value={newAssetName}
//                     onChange={(e) => setNewAssetName(e.target.value)}
//                 />
//                 <input
//                     className="input-account-amount"
//                     type="number"
//                     placeholder="Amount"
//                     value={newAssetAmount}
//                     onChange={(e) => setNewAssetAmount(e.target.value)}
//                 />
//                 <button className="input-account-button" onClick={e => addRecord(Asset(Number(newAssetAmount), newAssetName))}>Add</button>
//             </div>
//         );
//
//     // const component = () => {
//         return (
//             <div className="record-list">
//                 {records.map((record, index) => (
//                     <div key={index}>
//                         {record.record()}
//                     </div>
//                 ))}
//                 {addInputField}
//             </div>
//         )
//     // };
//     // return {
//         // records,
//         // addRecord,
//         // component
//     // };
// };
    


// export const Asset = Account;
// export const Liability = Account;
//
//   <div className="record-list">
                //     <p className="record-list-header">Assets</p>
                //     {assets.map((asset, i) => (
                //         <div key={i}>{asset.record()}</div>
                //     ))}
                //     {addInputField()}
                // </div>
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
