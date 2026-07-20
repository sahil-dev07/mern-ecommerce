import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { checkuser, createUser, signOut } from './authAPI';
import { setToken, clearToken } from '../../app/apiClient';

const initialState = {
  loggedInUser: null, // { id, role, name } — never holds the token or password
  status: 'idle',
  error: null,        // { status, message } on a failed login/signup, else null
};

// Splits the flat { id, role, name, token } auth response: the token goes to
// localStorage (read by apiClient on every request), the rest becomes the
// persisted loggedInUser. Single token setter for the login/signup path.
function storeAuth(payload) {
  const { token, ...user } = payload
  if (token) setToken(token)
  return user
}

export const createUserAsync = createAsyncThunk(
  'user/createUser',
  async (userdata, { rejectWithValue }) => {
    try {
      const response = await createUser(userdata);
      return storeAuth(response.data);
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const checkUserAsync = createAsyncThunk(
  'user/checkUser',
  async (loginInfo, { rejectWithValue }) => {
    try {
      const response = await checkuser(loginInfo);
      return storeAuth(response.data);
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const signOutAsync = createAsyncThunk(
  'user/signout',
  async () => {
    await signOut();
    clearToken(); // clear the token on explicit logout
    return null;
  }
);

export const authSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createUserAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createUserAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.loggedInUser = action.payload;
      })
      .addCase(createUserAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: action.error?.message };
      })
      .addCase(checkUserAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkUserAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.loggedInUser = action.payload;
      })
      .addCase(checkUserAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: action.error?.message };
      })
      .addCase(signOutAsync.fulfilled, (state) => {
        state.status = 'idle';
        state.loggedInUser = null;
      });
  },
});

export const selectLoggedInUser = (state) => state.user.loggedInUser
export const selectError = (state) => state.user.error

export default authSlice.reducer;
