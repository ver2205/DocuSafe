import { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Drawer, List, ListItemButton,
  Tooltip, Typography, Box, Avatar, Button, SwipeableDrawer
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuIcon from '@mui/icons-material/Menu';

function getInitials(name = '') {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
export default function Layout({ children, onToggleForm, showForm, user  }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = getInitials(user?.ime || user?.email || '');

  const menu = [
    { icon: <HomeIcon />,        label: 'Domov' },
    { icon: <DescriptionIcon />, label: 'Dokumenti' },
    { icon: <AccessTimeIcon />,  label: 'Opomniki' },
  ];

  const DrawerContent = (
    <List sx={{ mt: 1 }}>
      {menu.map((m) => (
        <Tooltip title={m.label} placement="right" key={m.label}>
          <ListItemButton sx={{ justifyContent: 'center', py: 3 }}>
            {m.icon}
          </ListItemButton>
        </Tooltip>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* TOP BAR */}
      <AppBar position="fixed" color="default" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={600}>DocuSafe</Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={onToggleForm}
            sx={{ borderRadius: 5 }}
          >
            {showForm ? 'Zapri' : '+ Dodaj'}
          </Button>
            <Avatar sx={{ width: 32, height: 32 }}>{initials}</Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* DESKTOP DRAWER */}
      <Drawer
        variant="permanent"
        sx={{
          width: { md: 70 },
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: { md: 70 },
            overflowX: 'hidden',
            top: 64,
            borderRight: 'none',
          },
          display: { xs: 'none', md: 'block' },
        }}
        open
      >
        {DrawerContent}
      </Drawer>

      {/* MOBILE DRAWER */}
      <SwipeableDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpen={() => {}}
        sx={{ display: { md: 'none' } }}
      >
        {DrawerContent}
      </SwipeableDrawer>

      {/* MAIN CONTENT */}
      <Box component="main" sx={{ flexGrow: 1, pt: 10, px: 2 }}>
        {children}
      </Box>
    </Box>
  );
}
