import { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Drawer, List, ListItemButton,
  Tooltip, Typography, Box, Avatar, Button, SwipeableDrawer
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';

import { useNavigate } from 'react-router-dom'; 
import { Link, useLocation } from 'react-router-dom';

function getInitials(name = '') {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
export default function Layout({ children, user  }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = getInitials(user?.ime || user?.email || '');
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    
    { icon: <DescriptionIcon />, label: 'Dokumenti', path: '/docs' },
    { icon: <AccessTimeIcon />,  label: 'Opomniki' , path: '/reminders'},
    { icon: <SettingsIcon />, label: 'Nastavitve', path: '/settings' }

  ];

  const DrawerContent = (
    <List>
    {menu.map((item, index) => (
      <Tooltip title={item.label} placement="right" key={index}>
        <ListItemButton
          onClick={() => navigate(item.path || '/')}
          selected={location.pathname === item.path}
          sx={{ justifyContent: 'center', py: 3 }}
        >
          {item.icon}
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
    variant="outlined"
    color="error"
    onClick={() => {
      localStorage.removeItem('token');
      window.location.reload(); 
    }}
  >
    Odjava
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
      
      <Box
  component="main"
  sx={{
    flexGrow: 1,
    pt: 7,
    px: 1,
    maxWidth: '1000px',  
    margin: '0 auto',   
  }}
>
  {children}
</Box>
    </Box>
  );
}
