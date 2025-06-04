import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Drawer,
} from "@mui/material";
import {
  Person,
  Security,
  Shield,
  SmartToy,
  School,
  Notifications,
  Help,
} from "@mui/icons-material";

const menuItems = [
  {
    id: "profile",
    label: "Profile Information",
    icon: <Person />,
  },
  {
    id: "security",
    label: "Security & Authentication",
    icon: <Security />,
  },
  {
    id: "privacy",
    label: "Privacy & Data Controls",
    icon: <Shield />,
  },
  {
    id: "ai-preferences",
    label: "AI Assistant Preferences",
    icon: <SmartToy />,
  },
  {
    id: "academic",
    label: "Academic Settings",
    icon: <School />,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Notifications />,
  },
  {
    id: "help",
    label: "Help & Support",
    icon: <Help />,
  },
];

function SettingsSidebar({ activeSection, onSectionChange }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 256,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 256,
          boxSizing: "border-box",
          bgcolor: "white",
          borderRight: 1,
          borderColor: "grey.200",
          pt: 8, // Account for header height
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Account Settings
        </Typography>

        <List sx={{ p: 0 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={activeSection === item.id}
                onClick={() => onSectionChange(item.id)}
                sx={{
                  borderRadius: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                  "&:hover": {
                    bgcolor: "grey.50",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color:
                      activeSection === item.id ? "white" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: activeSection === item.id ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default SettingsSidebar;
