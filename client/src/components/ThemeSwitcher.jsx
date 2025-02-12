import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemText, ListItemIcon } from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher = () => {
  const { currentTheme, toggleTheme, themes } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (themeName) => {
    toggleTheme(themeName);
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'var(--text)',
          '&:hover': {
            backgroundColor: 'var(--hover)',
          }
        }}
      >
        <PaletteIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: 'var(--surface)',
            color: 'var(--text)',
          }
        }}
      >
        {Object.entries(themes).map(([key, theme]) => (
          <MenuItem
            key={key}
            onClick={() => handleThemeChange(key)}
            selected={currentTheme === key}
            sx={{
              '&:hover': {
                backgroundColor: 'var(--hover)',
              },
              '&.Mui-selected': {
                backgroundColor: 'var(--primary)',
                '&:hover': {
                  backgroundColor: 'var(--secondary)',
                }
              }
            }}
          >
            <ListItemIcon>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: theme.primary,
                }}
              />
            </ListItemIcon>
            <ListItemText primary={theme.name} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeSwitcher; 