import { Grid, Paper, Typography, Box } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ScheduleIcon from '@mui/icons-material/Schedule';

export default function StatCards({ counts }) {
  // counts = { docs: 0, reminders: 0 }  – posreduje DashboardPage
  const stats = [
    { label: 'Dokumenti', value: counts.docs,      icon: <InsertDriveFileIcon fontSize="large" />, color: 'primary' },
    { label: 'Opomniki',  value: counts.reminders, icon: <ScheduleIcon fontSize="large" />,       color: 'secondary' },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((s) => (
        <Grid item xs={6} md={3} key={s.label}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box color={`${s.color}.main`}>{s.icon}</Box>
              <Box>
                <Typography variant="h5" fontWeight={600}>{s.value}</Typography>
                <Typography variant="subtitle2">{s.label}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
