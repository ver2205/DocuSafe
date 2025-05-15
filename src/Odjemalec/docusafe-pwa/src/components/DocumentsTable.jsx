import { DataGrid } from '@mui/x-data-grid';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import api from '../api/api';

export default function DocumentsTable({ rows, openPdf,refreshDocs }) {
    

  const columns = [
    { field: 'naslov', headerName: 'Naslov', flex: 2 },
    { field: 'tip',   headerName: 'Tip', flex: 1 },
    {
        field: 'datum',
        headerName: 'Rok',
        flex: 1,
        renderCell: ({ row }) => {
          const date = new Date(row.datum);
          return isNaN(date) ? '—' : date.toLocaleDateString('sl-SI');
        }
      }
      ,
      {
        field: 'placano',
        headerName: 'Plačano',
        width: 110,
        renderCell: ({ row }) => (
          <Checkbox
            checked={row.placano}
            onChange={async () => {
              try {
                await api.patch(`/dokumenti/${row.id}`, { placano: true });
                refreshDocs(); // ponovno naloži podatke
              } catch (err) {
                console.error('Napaka pri označevanju kot plačano:', err);
              }
            }}
          />
        ),
      },
    {
      field: 'action', headerName: '', width: 70, sortable: false,
      renderCell: ({ row }) => (
        <IconButton onClick={() => openPdf(row.id)}>
          <PictureAsPdfIcon />
        </IconButton>
      ),
    },
  ];


  return (
    <DataGrid
      autoHeight
      rows={rows}
      columns={columns}
      pageSize={5}
      rowsPerPageOptions={[5, 10]}
      sx={{
        borderRadius: 2,
        boxShadow: 1,
        bgcolor: 'background.paper',
        '& .MuiDataGrid-columnHeaders': { fontWeight: 600 },
      }}
    />
  );
}
