export interface iAccount {
    name: string;
    value: number;
    setName: (newName: string) => void;
    setValue: (newValue: number) => void;
    record: () => JSX.Element;
}

export interface iAsset extends iAccount {

}

export interface iLiability extends iAccount {

}

export interface iFinancialStatement {
    component: () => JSX.Element;
}
