import { FC, useState } from "react";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from "@mui/material/Stack";
import { Player, Sex } from "../Models/Model";
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Typography from '@mui/material/Typography';
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";
import { isNumeric } from "../Helpers/Helpers";

export interface PlayerEditProps {
    editplayer: Player;
    open: boolean;
    onSave: (player: Player) => void;
    handleClose: () => void;
}

const PlayerEdit: FC<PlayerEditProps> = ({ open, editplayer, onSave, handleClose }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [player, setPlayer] = useState(editplayer);
    const onValueChange = (objKey: string, value: string | boolean, number?: boolean, min?: number, max?: number,) => {
        if (value !== '') {
            if (number) {
                const num = isNumeric(value as string);
                if (!num)
                    return;
                else {
                    if (min && +value < min)
                        value = min as any;
                    else if (max && +value > max)
                        value = max as any;
                }
            }
        }
        const newPlayer = { ...player };
        (newPlayer as any)[objKey] = typeof (value) === "boolean" ?
            value ? Sex.Male : Sex.Female
            : number ? +value : value;
        setPlayer(newPlayer);
    }
    return <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
    >
        <DialogTitle id="responsive-dialog-title">
            {"Player"}
        </DialogTitle>
        <DialogContent>
            <Stack spacing={1}>
                {/* <TextField
                    autoFocus
                    margin="none"
                    id="PCode"
                    label="Code"
                    type="text"
                    variant="standard"
                    onChange={(val) => onValueChange('Code', val.target.value)}
                    value={player?.Code}
                /> */}
                <TextField
                    autoFocus
                    margin="none"
                    id="PDisplayName"
                    label="Display Name"
                    type="text"
                    variant="standard"
                    onChange={(val) => onValueChange('DisplayName', val.target.value)}
                    value={player?.DisplayName}
                />
                <TextField
                    autoFocus
                    margin="none"
                    id="Age"
                    label="Age"
                    type="text"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    variant="standard"
                    onChange={(val) => onValueChange('Age', val.target.value, true)}
                    value={player?.Age}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography>Female</Typography>
                    <Switch
                        checked={player?.Sex === Sex.Male}
                        onChange={(val) => onValueChange('Sex', val.target.checked)}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                    <Typography>Male</Typography>
                </Stack>
                <TextField
                    autoFocus
                    margin="none"
                    id="Weight"
                    label="Weight"
                    type="text"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', }}
                    variant="standard"
                    onChange={(val) => onValueChange('Weight', val.target.value, true)}
                    value={player?.Weight}
                />
                <TextField
                    autoFocus
                    margin="none"
                    id="AvgSkills"
                    label="Avg Skills"
                    type="text"
                    variant="standard"
                    onChange={(val) => onValueChange('AvgSkills', val.target.value, true, 0, 10)}
                    value={player?.AvgSkills}
                />
            </Stack>
        </DialogContent>
        <DialogActions>
                <Button autoFocus onClick={handleClose}>
                    Close
                </Button>
            <Button autoFocus onClick={() => onSave(player)}>
                Save
            </Button>
        </DialogActions>
    </Dialog >
}

export default PlayerEdit;