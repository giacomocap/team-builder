import { FC, useEffect, useState } from "react";
import { Player, PlayerList, PlayerListImport, Sex } from "../Models/Model";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Stack from "@mui/material/Stack";
import AddIcon from '@mui/icons-material/Add';
import PlayerEdit from "./PlayerEdit";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getRandomCode, saveTemplateAsFile } from "../Helpers/Helpers";
import FilePickerControl from "./FilePickerControl";
import Typography from '@mui/material/Typography';
import { default as reparto } from '../../inputTest.json'
import { getFromLocalStorage } from '../Helpers/LocalStorageHelpers';

export interface PlayerListDialogProps {
    editList: PlayerList;
    open: boolean;
    onSave: (list: PlayerList) => void;
    handleClose: () => void
}
const PlayerListDialog: FC<PlayerListDialogProps> = ({ open, onSave, handleClose, editList }) => {
    const theme = useTheme();
    const [listsKey, _] = useState("team-builder-lists");
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [list, setList] = useState(editList);
    const [playerEditOpen, setPlayerEditOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player>();
    const [file, setFile] = useState<File>()

    useEffect(() => {
        GetExistingLists();
    }, []);
    const GetExistingLists = async () => {
        const existingLists = await getFromLocalStorage<{ [code: string]: PlayerList }>(listsKey) ?? {};
        const mine = existingLists["dhsdfsfbjkf"];
        if (mine) { } else {
            debugger;
            importList(reparto as any);
        }
    }

    const addEditPlayer = (code?: string) => {
        if (code) {
            const player = list?.Players[code];
            setSelectedPlayer(player);
        }
        else {
            const player: Player = { Age: 0, AvgSkills: 0, Code: "", Sex: Sex.Male, Weight: 0, DisplayName: "" };
            setSelectedPlayer(player);
        }
        setPlayerEditOpen(true);
    }

    const onClosePlayerEdit = () => {
        setPlayerEditOpen(false);
    }

    const onSavePlayer = (player: Player) => {
        player.Code = player.Code ? player.Code : getRandomCode();
        const newPlayers = { ...list.Players }
        newPlayers[player.Code] = player;
        const newList = { ...list, Players: newPlayers };
        setList(newList);
        onClosePlayerEdit();
    }
    const onDelete = (code: string) => {
        const newPlayers = { ...list.Players }
        delete newPlayers[code];
        const newList = { ...list, Players: newPlayers };
        setList(newList);
    }

    const onChangeCode = (val: string) => {
        const newList = { ...list, DisplayName: val };
        setList(newList);
    }

    const importList = (playerListImport: PlayerListImport) => {
        let newList: PlayerList = { ...list, Code: list.Code !== "" ? list.Code : playerListImport.Code ? playerListImport.Code : "" };
        if (playerListImport.DisplayName)
            newList = { ...newList, DisplayName: playerListImport.DisplayName };
        // await onChangeCode(playerListImport.DisplayName);
        let newPlayers = { ...newList.Players }
        for (let index = 0; index < playerListImport.Players.length; index++) {
            const player = playerListImport.Players[index];
            player.Code = player.Code ? player.Code : getRandomCode();
            newPlayers[player.Code] = player;
            // await onSavePlayer(player)
        }
        newList = { ...newList, Players: newPlayers };
        setList(newList);
    }

    const onFileChanged = async (newFile?: File) => {
        setFile(newFile);
        if (newFile) {
            const playerListImport = JSON.parse(await newFile.text()) as PlayerListImport;
            console.log(playerListImport);
            importList(playerListImport);
        }
    }

    const onExportClicked = () => {
        if (list.DisplayName && list.DisplayName !== "" && Object.values(list.Players).length !== 0) {
            const playerListExport: PlayerListImport = { Players: [], DisplayName: list.DisplayName };
            Object.values(list.Players).forEach(p => playerListExport.Players.push(p));
            saveTemplateAsFile(list.DisplayName + ".json", playerListExport);
        }
    }
    return <div>
        <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">
                <Stack>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="end"
                        spacing={2}
                    >
                        {"Player list"}
                        <Stack direction="row" spacing={1}>
                            <FilePickerControl file={file} onFilePicker={onFileChanged} />
                            {Object.values(list.Players).length !== 0 &&
                                <Button variant="outlined" size="small" onClick={_e => onExportClicked()}>Export</Button>
                            }
                        </Stack>
                    </Stack>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="end"
                        spacing={2}
                    >
                        <TextField
                            autoFocus
                            margin="none"
                            id="List Name"
                            label="List Name"
                            type="text"
                            variant="standard"
                            onChange={(v) => onChangeCode(v.target.value)}
                            value={list?.DisplayName}
                        />
                        <Stack direction="row" spacing={1} alignItems="end">
                            <Typography>Count: {Object.values(list.Players).length}</Typography>
                            <Button variant="outlined" size="small" onClick={() => addEditPlayer()} startIcon={<AddIcon />}>
                                Add player
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <TableContainer component={Paper}>
                        <Table size="small" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    {/* <TableCell>Code</TableCell> */}
                                    <TableCell align="right">DisplayName</TableCell>
                                    <TableCell align="right">Age</TableCell>
                                    <TableCell align="right">Sex</TableCell>
                                    <TableCell align="right">Weight</TableCell>
                                    <TableCell align="right">AvgSkills</TableCell>
                                    <TableCell align="right"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {list?.Players && Object.values(list.Players).map((row) => (
                                    <TableRow
                                        key={row.Code}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        {/* <TableCell component="th" scope="row">
                                            {row.Code}
                                        </TableCell> */}
                                        <TableCell component="th" scope="row" align="right">{row.DisplayName}</TableCell>
                                        <TableCell align="right">{row.Age}</TableCell>
                                        <TableCell align="right">{row.Sex === Sex.Male ? "M" : "F"}</TableCell>
                                        <TableCell align="right">{row.Weight}</TableCell>
                                        <TableCell align="right">{row.AvgSkills}</TableCell>
                                        <TableCell align="right">
                                            <IconButton aria-label="edit" size="small" onClick={() => addEditPlayer(row.Code)}>
                                                <EditIcon fontSize="inherit" />
                                            </IconButton>
                                            <IconButton aria-label="delete" size="small" onClick={() => onDelete(row.Code)}>
                                                <DeleteIcon fontSize="inherit" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleClose}>
                    Close
                </Button>
                <Button autoFocus onClick={() => onSave(list)}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
        {
            playerEditOpen && <PlayerEdit
                handleClose={onClosePlayerEdit}
                onSave={onSavePlayer}
                open={playerEditOpen}
                editplayer={selectedPlayer!} />
        }
    </div >
}
export default PlayerListDialog;