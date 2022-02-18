export interface Player {
    Code: string;
    DisplayName?: string;
    Sex: Sex;
    Age: number;
    Weight?: number;
    AvgSkills: number;
}

export enum Sex {
    Male, Female
}
export interface PlayerList {
    Code: string;
    DisplayName: string;
    Players: { [code: string]: Player };
}

export interface Team {
    Index: number;
    Players: { [code: string]: ExtendedPlayer };
    AvgSkill: number;
}

export interface ExtendedPlayer extends Player {
    totalPerc: number;
    agePerc: number;
    skillPerc: number;
}

export interface PlayerListImport {
    DisplayName?: string;
    Players: Player[];
}
