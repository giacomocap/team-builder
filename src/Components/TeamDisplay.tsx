import Box from "@mui/material/Box";
import { Team, Sex } from "../Models/Model";
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PureComponent } from "react";

export interface TeamDisplayProp {
    generatedTeams: { [index: number]: Team };
}
class TeamDisplay extends PureComponent<TeamDisplayProp, {}> {
    constructor(props: TeamDisplayProp | Readonly<TeamDisplayProp>) {
        super(props);
    }
    render() {
        return (
            <Box sx={{
                flexWrap: 'wrap', display: 'flex',
            }}>
                {Object.values(this.props.generatedTeams).map(team =>
                    <Stack key={"team" + team.Index} sx={{
                        p: 1,
                        m: 1,
                    }} spacing={2}>
                        <Typography variant="h5" component="div">
                            Team {team.Index + 1}
                        </Typography>
                        {Object.values(team.Players).map(p =>
                            <Typography key={"player" + p.Code} variant="body1" component="div">
                                {p.DisplayName} - {(p.Sex === Sex.Male ? "M" : "F")}
                            </Typography>
                        )}
                    </Stack>
                )}
            </Box>
        );
    }
}

export default TeamDisplay;