import IconButton from '@mui/material/IconButton';
import { FC, useEffect, useState } from "react"
import { Player, PlayerList } from "../Models/Model";
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import PlayerListDialog from './PlayerListDialog';
import { getFromLocalStorage, setInLocalStorage } from '../Helpers/LocalStorageHelpers';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { getRandomCode } from '../Helpers/Helpers';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Checkbox from '@mui/material/Checkbox';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TeamMaker from './TeamMaker';

interface SelectableEditableProp {
    label: string
    checked: boolean;
    onSelect: (checked: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
}

const SelectableEditable = ({ label, checked, onSelect, onDelete, onEdit }: SelectableEditableProp) => {
    return (<Card >
        <CardContent sx={{ padding: '0px 5px 0px 5px', textAlign: 'center' }}>
            <Typography variant="h6" component="div">
                {label}
            </Typography>
        </CardContent>
        <CardActions sx={{ padding: '0' }}>
            <Checkbox
                checked={checked}
                onChange={(_, val) => onSelect(val)}
                inputProps={{ 'aria-label': 'controlled' }}
            />
            <IconButton aria-label="edit" onClick={() => onEdit()}>
                <EditIcon fontSize="inherit" />
            </IconButton>
            <IconButton aria-label="delete" onClick={() => onDelete()}>
                <DeleteIcon fontSize="inherit" />
            </IconButton>
        </CardActions>
    </Card>
    );
}
interface ConfirmDeleteDialogProp {
    selectedListDelete?: PlayerList;
    setSelectedListDelete: React.Dispatch<React.SetStateAction<PlayerList | undefined>>;
    onDelete: (list: PlayerList) => Promise<void>;
}

const ConfirmDeleteDialog = ({ selectedListDelete, setSelectedListDelete, onDelete }: ConfirmDeleteDialogProp) => {
    return <Dialog
        sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
        maxWidth="xs"
        open={selectedListDelete ? true : false}
    >
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogActions>
            <Button autoFocus onClick={() => setSelectedListDelete(undefined)}>
                Cancel
            </Button>
            <Button onClick={() => onDelete(selectedListDelete!)}>Ok</Button>
        </DialogActions>
    </Dialog>
}

const AllPlayers: FC = () => {
    const [listsKey, _] = useState("team-builder-lists");
    const [open, setOpen] = useState(false);
    const [existingLists, setExistingLists] = useState<{ [code: string]: PlayerList }>({});
    const [selectedList, setSelectedList] = useState<PlayerList>();
    const [selectedListDelete, setSelectedListDelete] = useState<PlayerList>();
    const [checked, setChecked] = useState<string | undefined>(undefined);

    useEffect(() => {
        GetExistingLists();
    }, []);

    const GetExistingLists = async () => {
        const existingLists = await getFromLocalStorage<{ [code: string]: PlayerList }>(listsKey) ?? {};
        setExistingLists(existingLists);
    }

    const addEditList = (code?: string) => {
        if (code) {
            const listToEdit = existingLists[code];
            setSelectedList(listToEdit);
        }
        else {
            const listToEdit: PlayerList = { Code: "", DisplayName: "", Players: {} };
            setSelectedList(listToEdit);
        }
        setOpen(true);
    }

    const handleClose = () => {
        setSelectedList(undefined);
        setOpen(false);
    };

    const onSave = async (list: PlayerList) => {
        list.Code = list.Code ? list.Code : getRandomCode();
        // debugger;
        // const newP: { [code: string]: Player } = {};
        // for (let index = 0; index < 30; index++) {
        //     const element: Player = { Code: getRandomCode(), DisplayName: 'player' + index, Age: getRandomNumberBetweenRange(16, 12), AvgSkills: getRandomNumberBetweenRange(10, 1), Sex: getRandomNumberBetweenRange(1), Weight: getRandomNumberBetweenRange(80, 30) };
        //     newP[element.Code] = element;
        // }
        // list.Players = newP;
        const newLists = { ...existingLists };
        newLists[list.Code] = list;
        await setInLocalStorage(listsKey, newLists);
        await GetExistingLists();
        handleClose();
    }
    const onDelete = async (list: PlayerList) => {
        setChecked(undefined);
        const newLists = { ...existingLists };
        delete newLists[list.Code];
        await setInLocalStorage(listsKey, newLists);
        await GetExistingLists();
        handleClose();
    }

    return <div>
        {open && <PlayerListDialog handleClose={handleClose} onSave={onSave} open={open} editList={selectedList!} />}
        <ConfirmDeleteDialog selectedListDelete={selectedListDelete} setSelectedListDelete={setSelectedListDelete} onDelete={onDelete} />
        <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
                <Tooltip title="Add list">
                    <IconButton aria-label="add" onClick={() => addEditList()}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
                {Object.values(existingLists).map(list => <SelectableEditable checked={list.Code === checked} label={list.DisplayName} key={list.Code} onSelect={(val) => setChecked(val ? list.Code : undefined)} onDelete={() => setSelectedListDelete(list)} onEdit={() => addEditList(list.Code)} />)}
            </Stack>
            {checked && <TeamMaker list={existingLists[checked]} />}
        </Stack>
    </div >
}
export default AllPlayers;