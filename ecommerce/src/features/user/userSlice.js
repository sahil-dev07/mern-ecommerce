import { createAsyncThunk, createSlice, isRejected } from '@reduxjs/toolkit';
import { fetchLoggedInUser, fetchLoggedInUserOrders, updateUser } from './userAPI';

const initialState = {
  userInfo: null,
  status: 'idle',
  error: null, // last failed-request error { status, message }
};

export const fetchLoggedInUserAsync = createAsyncThunk(
  'users/fetchLoggedInUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetchLoggedInUser(userId);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
)

export const fetchLoggedInUserOrdersAsync = createAsyncThunk(
  'users/fetchLoggedInUserOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetchLoggedInUserOrders(userId);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const updateUserAsync = createAsyncThunk(
  'users/updateUser',
  async (update, { rejectWithValue }) => {
    try {
      const response = await updateUser(update);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoggedInUserAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLoggedInUserAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        // this info can be different or more than the logged-in user info
        state.userInfo = action.payload;
      })
      .addCase(fetchLoggedInUserOrdersAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLoggedInUserOrdersAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.userInfo.orders = action.payload;
      })
      .addCase(updateUserAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.userInfo = action.payload;
      })
      // Unstick status + record error on any rejected user thunk.
      .addMatcher(
        isRejected(fetchLoggedInUserAsync, fetchLoggedInUserOrdersAsync, updateUserAsync),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload ?? { message: action.error?.message };
        }
      );
  },
});

// Optional-chain the orders read: userInfo is null until the profile loads.
export const selectUserOrders = (state) => state.users.userInfo?.orders
export const selectUserInfo = (state) => state.users.userInfo
export const selectUserError = (state) => state.users.error

export default userSlice.reducer;
