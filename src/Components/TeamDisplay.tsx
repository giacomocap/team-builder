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
                    <Stack sx={{
                        p: 1,
                        m: 1,
                    }} spacing={2}>
                        <Typography variant="h5" component="div">
                            Team {team.Index}
                        </Typography>
                        {Object.values(team.Players).map(p =>
                            <Typography variant="body1" component="div">
                                {p.DisplayName} - {(p.Sex === Sex.Male ? "M" : "F")} - {p.totalPerc.toFixed(2)}
                            </Typography>
                        )}
                        <Typography variant="h6" component="div">
                            {team.AvgSkill.toFixed(2)}
                        </Typography>
                    </Stack>
                )}
            </Box>
        );
    }
}

export default TeamDisplay;