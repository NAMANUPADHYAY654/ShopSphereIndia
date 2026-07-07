import { createSlice } from '@reduxjs/toolkit';

function getInitialDarkMode() {
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) {
    return stored === 'true';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const initialState = {
  darkMode: getInitialDarkMode(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    setTheme: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', state.darkMode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
