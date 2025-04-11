import React, { useState, useEffect } from 'react';
// import { Asset, Liability, RecordList } from './Account';
import { iFinancialStatement, iAccount } from './types';

// const BalanceSheet = (): iFinancialStatement => {
// const BalanceSheet = (): React.FC => {
const BalanceSheet = () => {
    // const BalanceSheet = (): JSX.Element => {
    //example data
    // const [assets, setAssets] = useState<iAccount[]>([Asset(1000, 'Cash')]);
    // const [liabilities, setLiabilities] = useState([Liability(500, 'Accounts Payable')]);

    // const recordList = RecordList([Asset(1000, 'Cash')]);

    // const c = Asset(1000, 'Cash');
    // const ar = Asset(2000, 'Accounts Receivable');
    // const liability = Liability(500, 'Accounts Payable');

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const [newAssetName, setNewAssetName] = useState('');
    const [newAssetAmount, setNewAssetAmount] = useState('');
    const [newLiabilityName, setNewLiabilityName] = useState('');
    const [newLiabilityAmount, setNewLiabilityAmount] = useState('');

    function addAsset() {
    //
    // } addAsset = () => {
        // if (!newAssetName || isNaN(Number(newAssetAmount))) return;
        // setAssets([...assets, Asset(Number(newAssetAmount), newAssetName)]);
        // setNewAssetName('');
        // setNewAssetAmount('');

        // recordList.addRecord(Asset(Number(newAssetAmount), newAssetName));
        setNewAssetName('');
        setNewAssetAmount('');
    };


    // setAssets([...assets, Asset(200, "test")]);
    // const addInputField = (): JSX.Element => {
    //     return (
    //         <div className="input-account">
    //             <input
    //                 className="input-account-name"
    //                 type="text"
    //                 placeholder="Asset Name"
    //                 value={newAssetName}
    //                 onChange={(e) => setNewAssetName(e.target.value)}
    //             />
    //             <input
    //                 className="input-account-amount"
    //                 type="number"
    //                 placeholder="Amount"
    //                 value={newAssetAmount}
    //                 onChange={(e) => setNewAssetAmount(e.target.value)}
    //             />
    //             <button className="input-account-button" onClick={e => recordList.addRecord(Asset(Number(newAssetAmount), newAssetName))}>Add</button>
    //         </div>
    //     );
    // }

    // const component = () => (
    // return (
    //     <div className="financial-statement">
    //         <div className="fs-header">
    //             <h2>Balance Sheet as of {today}</h2>
    //         </div>
    //         <div style={{ display: "flex" }}>
    //             {recordList.component()}
    //             <div className="record-list">
    //                 <p className="record-list-header">Assets</p>
    //                 {assets.map((asset, i) => (
    //                     <div key={i}>{asset.record()}</div>
    //                 ))}
    //                 {addInputField()}
    //             </div>
    //             <div className="record-list">
    //                 <p className="record-list-header">Liabilities</p>
    //                 {liability.record()}
    //             </div>
    //         </div>
    //     </div>
    // );
    //
    // return {
    //     component
    // }
}

export default BalanceSheet;
