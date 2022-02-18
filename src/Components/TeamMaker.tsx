import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState, useRef } from 'react';
import { ExtendedPlayer, Player, PlayerList, Sex, Team } from '../Models/Model';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { GetPercentage, getSum, isNumeric, NotAlreadyPresent, permute, shuffle } from '../Helpers/Helpers';
import Button from '@mui/material/Button';
import TeamDisplay from './TeamDisplay';
import { useReactToPrint } from 'react-to-print';


export interface TeamMakerProps {
    list: PlayerList;
}
const TeamMaker = ({ list }: TeamMakerProps) => {
    const [selectedPeople, setSelectedPeople] = useState({ ...list.Players });
    const [removedPeople, setRemovedPeople] = useState<Player[]>([]);
    const [teamNumber, setTeamNumber] = useState(0);
    const [generatedTeams, setGeneratedTeams] = useState<{ [index: number]: Team }>({});
    const [passes, setPasses] = useState(0);
    const [passedTime, setPassedTime] = useState(0);
    const [avgTeamSkill, setAvgTeamSkill] = useState(0);
    const componentRef = useRef(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    useEffect(() => {
        setSelectedPeople({ ...list.Players });
        setRemovedPeople([]);
    }, [list.Players]);


    const onChangeNotSelected = (players: Player[]) => {
        setRemovedPeople(players ?? []);
        const newSelected: { [x: string]: Player; } = {};
        Object.keys(list.Players)
            .filter(key => players.findIndex((p) => p.Code === key) === -1)
            .forEach(key => {
                newSelected[key] = list.Players[key];
            });
        setSelectedPeople(newSelected);
    }

    const onChangeTeams = (value: string) => {
        const num = isNumeric(value);
        if (!num)
            return;
        else {
            setTeamNumber(+value);
        }
    }

    const generateTeams = () => {
        if (teamNumber < 1 || teamNumber > Object.values(selectedPeople).length)
            return;

        const now = performance.now();
        const mappedSkills: ExtendedPlayer[] = [];
        const male: ExtendedPlayer[] = [];
        let maleSkill = 0;
        const female: ExtendedPlayer[] = [];
        let femaleSkill = 0;
        for (const player of (Object.values(selectedPeople))) {
            const agePerc = GetPercentage(16, 12, player.Age);
            const skillPerc = GetPercentage(10, 1, player.AvgSkills);
            const totalPerc = (agePerc + skillPerc) / 2;
            const extP = { ...player, agePerc, skillPerc, totalPerc };
            mappedSkills.push(extP);
            if (player.Sex === Sex.Male) {
                male.push(extP);
                maleSkill += totalPerc;
            } else {
                female.push(extP);
                femaleSkill += totalPerc;
            }
        }
        shuffle(mappedSkills);
        const avgMaleSkill = maleSkill / male.length;
        const avgFemaleSkill = femaleSkill / female.length;
        const avgTeamSkill = (avgMaleSkill + avgFemaleSkill) / 2;
        setAvgTeamSkill(avgTeamSkill);
        
        const maleForTeam = Math.floor(male.length / teamNumber);
        let malehowManyOut = male.length % teamNumber;
        const femaleForTeam = Math.floor(female.length / teamNumber);
        let femalehowManyOut = female.length % teamNumber;
        const allowedPerc = 5;

        let [maxMaleAllowed, minMaleAllowed] = getPercentages(avgMaleSkill, allowedPerc);
        let [maxFemaleAllowed, minFemaleAllowed] = getPercentages(avgFemaleSkill, allowedPerc);
        const allMalePerm: ExtendedPlayer[][] = permute(male, maleForTeam)!;
        const allFemalePerm: ExtendedPlayer[][] = permute(female, femaleForTeam)!;
        const allFemaleOverPerm: ExtendedPlayer[][] = permute(female, femaleForTeam + 1)!;
        const allMaleOverPerm: ExtendedPlayer[][] = permute(male, maleForTeam + 1)!;

        let allAllowedMaleOverPerm: ExtendedPlayer[][] = [];
        let allAllowedFemaleOverPerm: ExtendedPlayer[][] = [];
        let allAllowedMalePerm: ExtendedPlayer[][] = [];
        let allAllowedFemalePerm: ExtendedPlayer[][] = [];

        
        let malePerc = 0;
        
        if (allMalePerm.length > 0) {
            while (allAllowedMalePerm.length < teamNumber) {
                allAllowedMalePerm = allMalePerm.length > 0 ? allMalePerm.filter((value) => PercentageRemover(value, maxMaleAllowed, minMaleAllowed)) : allMalePerm;
                if (allAllowedMalePerm.length < teamNumber)
                    [maxMaleAllowed, minMaleAllowed] = getPercentages(avgMaleSkill, allowedPerc + malePerc++);
            }
        } else {
            allAllowedMalePerm = allMalePerm;
        }
        malePerc = 0;
        if (allMaleOverPerm.length > 0) {
            [maxMaleAllowed, minMaleAllowed] = getPercentages(avgMaleSkill, allowedPerc + malePerc++);
            while (malehowManyOut > 0 ? allAllowedMaleOverPerm.length < malehowManyOut : false) {
                allAllowedMaleOverPerm = allMaleOverPerm.length > 0 ? allMaleOverPerm.filter((value) => PercentageRemover(value, maxMaleAllowed, minMaleAllowed)) : allMaleOverPerm;
                if (allAllowedMaleOverPerm.length < malehowManyOut) {
                    [maxMaleAllowed, minMaleAllowed] = getPercentages(avgMaleSkill, allowedPerc + malePerc++);
                }
            }
        } else {
            allAllowedMaleOverPerm = allMaleOverPerm
        }
        


        let femalePerc = 0;
        
        if (allFemalePerm.length > 0) {
            while (allAllowedFemalePerm.length < teamNumber) {
                allAllowedFemalePerm = allFemalePerm.filter((value) => PercentageRemover(value, maxFemaleAllowed, minFemaleAllowed));

                if (allAllowedFemalePerm.length < teamNumber)
                    [maxFemaleAllowed, minFemaleAllowed] = getPercentages(avgFemaleSkill, allowedPerc + femalePerc++);
            }
        } else { allAllowedFemalePerm = allFemalePerm; }

        femalePerc = 0;
        if (allFemaleOverPerm.length > 0) {
            [maxFemaleAllowed, minFemaleAllowed] = getPercentages(avgFemaleSkill, allowedPerc + femalePerc++);
            while (femalehowManyOut > 0 ? allAllowedFemaleOverPerm.length < femalehowManyOut : false) {
                allAllowedFemaleOverPerm = allFemaleOverPerm.filter((value) => PercentageRemover(value, maxFemaleAllowed, minFemaleAllowed));

                if (femalehowManyOut > 0 ? allAllowedFemaleOverPerm.length < femalehowManyOut : false)
                    [maxFemaleAllowed, minFemaleAllowed] = getPercentages(avgFemaleSkill, allowedPerc + femalePerc++);
            }
        } else {
            allAllowedFemaleOverPerm = allFemaleOverPerm;
        }
        
        let maleFound = male.length === 0 ? true : false;
        let whileMale = 0;
        const codeGetter = function (v: ExtendedPlayer) { return v.Code };
        const generatedTeams: { [index: number]: Team } = {};

        while (!maleFound) {
            shuffle(allAllowedMalePerm);
            shuffle(allAllowedMaleOverPerm);
            let nsquadWithoutRepetition: ExtendedPlayer[][] = [];
            for (let index = 0; index < teamNumber; index++) {
                nsquadWithoutRepetition.push([]);
            }
            for (let index = 0; index < teamNumber - malehowManyOut; index++) {
                const squad = allAllowedMalePerm.find(sugg => NotAlreadyPresent(sugg, nsquadWithoutRepetition, codeGetter));
                if (squad)
                    nsquadWithoutRepetition[index] = squad;
            }
            for (let index = 0; index < malehowManyOut; index++) {
                const squad = allAllowedMaleOverPerm.find(sugg => NotAlreadyPresent(sugg, nsquadWithoutRepetition, codeGetter));
                if (squad) {
                    const i = nsquadWithoutRepetition.findIndex(t => t.length === 0);
                    nsquadWithoutRepetition[i] = squad;
                }
            }
            if (nsquadWithoutRepetition.every(t => t.length > 0) || nsquadWithoutRepetition.filter(t => t.length > 0).length >= malehowManyOut) {
                maleFound = true;

                nsquadWithoutRepetition.forEach((team, i) => {
                    generatedTeams[i] = { Index: i, Players: {}, AvgSkill: 0 };
                    team.forEach(p => generatedTeams[i].Players[p.Code] = p);
                });
            }
            whileMale++;
            if (!maleFound && (whileMale % allAllowedMalePerm.length) === 0) {
                [maxMaleAllowed, minMaleAllowed] = getPercentages(avgMaleSkill, allowedPerc + malePerc++);
                allAllowedMalePerm = allMalePerm.filter((value) => PercentageRemover(value, maxMaleAllowed, minMaleAllowed));
                if (malehowManyOut > 0)
                    allAllowedMaleOverPerm = allMaleOverPerm.filter((value) => PercentageRemover(value, maxMaleAllowed, minMaleAllowed));
            }
        }
        let femaleFound = female.length === 0 ? true : false;
        let whileFemale = 0;
        while (!femaleFound) {
            shuffle(allAllowedFemalePerm);
            shuffle(allAllowedFemaleOverPerm);
            let nsquadWithoutRepetition: ExtendedPlayer[][] = [];
            for (let index = 0; index < teamNumber; index++) {
                nsquadWithoutRepetition.push([]);
            }
            for (let index = 0; index < teamNumber - femalehowManyOut; index++) {
                const squad = allAllowedFemalePerm.find(sugg => NotAlreadyPresent(sugg, nsquadWithoutRepetition, codeGetter));
                if (squad)
                    nsquadWithoutRepetition[index] = squad;
            }
            for (let index = 0; index < femalehowManyOut; index++) {
                const squad = allAllowedFemaleOverPerm.find(sugg => NotAlreadyPresent(sugg, nsquadWithoutRepetition, codeGetter));
                if (squad) {
                    const i = nsquadWithoutRepetition.findIndex(t => t.length === 0);
                    nsquadWithoutRepetition[i] = squad;
                }
            }
            if (nsquadWithoutRepetition.every(t => t.length > 0) || nsquadWithoutRepetition.filter(t => t.length > 0).length >= femalehowManyOut) {
                femaleFound = true;
                const longSquads = nsquadWithoutRepetition.map((e, i) => { return { i, length: e.length } }).filter(e => e.length === femaleForTeam + 1);
                const shortSquads = nsquadWithoutRepetition.map((e, i) => { return { i, length: e.length } }).filter(e => e.length === femaleForTeam);
                const usedIndexes: number[] = [];
                if (male.length === 0) {
                    nsquadWithoutRepetition.forEach((team, i) => {
                        generatedTeams[i] = { Index: i, Players: {}, AvgSkill: 0 };
                        team.forEach(p => generatedTeams[i].Players[p.Code] = p);
                        generatedTeams[i].AvgSkill = getSum(team, (p) => p.totalPerc) / team.length;
                    });
                } else {
                    Object.keys(generatedTeams).forEach(e => {
                        const players = Object.values(generatedTeams[+e].Players);
                        const isShort = players.length === maleForTeam;
                        let toAdd: { i: number; length: number; } | undefined;
                        if (isShort) {
                            toAdd = longSquads.find(e => !usedIndexes.includes(e.i));
                        }
                        if (toAdd === null || toAdd === undefined) {
                            toAdd = shortSquads.find(e => !usedIndexes.includes(e.i))!;
                        }
                        usedIndexes.push(toAdd.i);
                        const team = nsquadWithoutRepetition[toAdd.i];
                        team.forEach(p => generatedTeams[+e].Players[p.Code] = p);
                        generatedTeams[+e].AvgSkill = getSum(players, (p) => p.totalPerc) / players.length;
                    });;
                }


            }
            whileFemale++;
            if (!femaleFound && (whileFemale % allAllowedFemalePerm.length === 0)) {
                [maxFemaleAllowed, minFemaleAllowed] = getPercentages(avgFemaleSkill, allowedPerc + femalePerc++);
                allAllowedFemalePerm = allFemalePerm.filter((value) => PercentageRemover(value, maxFemaleAllowed, minFemaleAllowed));
                if (femalehowManyOut > 0)
                    allAllowedFemaleOverPerm = allFemaleOverPerm.filter((value) => PercentageRemover(value, maxFemaleAllowed, minFemaleAllowed));
            }
        }


        const passed = (performance.now() - now) / 1000;
        setPassedTime(passed);
        setGeneratedTeams(generatedTeams);
        setPasses(whileMale + whileFemale);
    }
    const PercentageRemover = function (suggest: ExtendedPlayer[], maxAllowed: number, minAllowed: number) {
        const teamSkills = getSum(suggest, (val) => val.totalPerc) / suggest.length;
        return teamSkills <= maxAllowed && teamSkills >= minAllowed;
    }
    const getPercentages = (objPercentage: number, allowedPerc = 5): [number, number] => {
        const percDelta = allowedPerc !== 0 ? (allowedPerc * objPercentage) / 100 : 0;
        const maxAllowed = objPercentage + percDelta;
        const minAllowed = objPercentage - percDelta;
        return [maxAllowed, minAllowed];
    }


    return <Stack spacing={2}>
        <Stack sx={{ alignItems: "end", alignContent: "center" }} direction="row" spacing={2}>
            <Typography variant="body1" component="div">
                {list.DisplayName}: {Object.keys(selectedPeople).length} selected
            </Typography>
            <Autocomplete
                sx={{ minWidth: 150, width: 300 }}
                multiple
                id="tags-standard"
                options={Object.values(list.Players)}
                getOptionLabel={(option) => (option.DisplayName ?? option.Code) + " " + (option.Sex === Sex.Male ? "M" : "F")}
                onChange={(_, value) => onChangeNotSelected(value)}
                value={removedPeople}
                isOptionEqualToValue={(p1, p2) => p1.Code === p2.Code}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="standard"
                        label="Remove players"
                        placeholder="Players"
                    />
                )}
            />
        </Stack>
        <Stack sx={{ alignItems: "end" }} direction="row" spacing={2}>
            <TextField
                autoFocus
                margin="none"
                id="Teams"
                label="Teams"
                type="text"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                variant="standard"
                onChange={(val) => onChangeTeams(val.target.value)}
                value={teamNumber}
            />
            <Button variant="outlined" onClick={() => generateTeams()}>Generate</Button>
            {/* <Typography variant="body1" component="div">
                {passes}
            </Typography>
            <Typography variant="body1" component="div">
                {avgTeamSkill.toFixed(2)}
            </Typography>
            <Typography variant="body1" component="div">
                In: {passedTime.toFixed(2)}
            </Typography> */}
            <Button variant="outlined" disabled={Object.keys(generatedTeams).length === 0} onClick={handlePrint}>Print</Button>
        </Stack>
        <TeamDisplay ref={componentRef} generatedTeams={generatedTeams} />
    </Stack>
}

export default TeamMaker;