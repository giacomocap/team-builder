import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { useEffect, useRef, useState } from "react";

export interface FilePickerProps {
    file: File | undefined;
    onFilePicker(file?: File): void;
}

export const FilePickerControl = (props: FilePickerProps) => {
    // const [inputFile, setInputFile] = useState<File | undefined>(undefined);
    const [selectedFile, setFile] = useState<File | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFile(props.file);
    }, [props.file])

    const onClick = (files: FileList | null): void => {
        if (files && files?.length > 0) {
            const file = files[0];
            if (file) {
                setFile(file);
                props.onFilePicker(file);
            }
        }
    }

    const onClickDelete = (_ev: any): void => {
        setFile(undefined);
        props.onFilePicker(undefined);
    }

    return <Box sx={{
        flexWrap: 'wrap', display: 'flex',
    }}>
        {selectedFile && selectedFile.size > 0 ?
            <Chip label={selectedFile.name} onDelete={onClickDelete} />
            :
            <>
                <input type="file" accept=".json,application/JSON" name="inputfile" multiple={false} hidden ref={inputRef} onChange={(e) => { onClick(e.target.files); e.target.files = null; }} id="inputfile" />
                <Button variant="outlined" size="small" onClick={_e => inputRef?.current?.click()}>Import</Button>
            </>}
    </Box>
}
export default FilePickerControl;