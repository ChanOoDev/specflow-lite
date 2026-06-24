





import { createTheme, MantineColorsTuple } from '@mantine/core';

// Indigo-based primary — professional, developer-friendly
const primary: MantineColorsTuple = [
  '#edf2ff',
  '#dbe4ff',
  '#bac8ff',
  '#91a7ff',
  '#748ffc',
  '#5c7cfa',
  '#4c6ef5',
  '#4263eb',
  '#3b5bdb',
  '#364fc7',
];

// Refined slate grays — warmer than Mantine defaults
const slate: MantineColorsTuple = [
  '#f8f9fa',
  '#f1f3f5',
  '#e9ecef',
  '#dee2e6',
  '#ced4da',
  '#adb5bd',
  '#868e96',
  '#495057',
  '#343a40',
  '#212529',
];

export const theme = createTheme({
  primaryColor: 'primary',
  colors: { primary, slate },
  defaultRadius: 'md',

  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
  },

  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
        shadow: 'sm',
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
        shadow: 'sm',
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
