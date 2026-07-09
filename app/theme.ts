import { createTheme, MantineColorsTuple } from '@mantine/core';

// Slate blue primary — refined, understated
const slate: MantineColorsTuple = [
  '#f8f9fb',
  '#eef1f5',
  '#dde2ea',
  '#c4ccd8',
  '#a8b3c4',
  '#8b99b0',
  '#6e7f9a',
  '#5a6b84',
  '#4a5870',
  '#3d4a5e',
];

// Sage green accent — warm, natural
const sage: MantineColorsTuple = [
  '#f4f7f5',
  '#e4ebe6',
  '#c9d7cd',
  '#a6bfad',
  '#84a78e',
  '#689173',
  '#527a5c',
  '#436349',
  '#374f3b',
  '#2d3f31',
];

// Warm grays — softer than cold steel
const warm: MantineColorsTuple = [
  '#fafaf9',
  '#f5f4f2',
  '#eae8e4',
  '#d9d6d0',
  '#c4bfb7',
  '#a9a29a',
  '#8e857c',
  '#736a62',
  '#5c5349',
  '#463e36',
];

export const theme = createTheme({
  primaryColor: 'slate',
  colors: { slate, sage, warm },
  defaultRadius: 'md',

  fontFamily:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: '600',
  },

  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
  },

  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  components: {
    Card: {
      defaultProps: {
        shadow: 'xs',
        radius: 'md',
        padding: 'lg',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
        fw: 500,
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'xs',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    MultiSelect: {
      defaultProps: {
        radius: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
        fw: 500,
      },
    },
    NavLink: {
      defaultProps: {
        radius: 'md',
      },
    },
    Alert: {
      defaultProps: {
        radius: 'md',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
        shadow: 'lg',
      },
    },
    Menu: {
      defaultProps: {
        shadow: 'md',
      },
    },
  },
});
