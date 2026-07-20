import { createAsyncThunk, createSlice, isRejected } from '@reduxjs/toolkit';
import { addToCart, fetchItemsByUserId, updateCart, deleteItemFromCart, resetCart } from './cartAPI';

const initialState = {
  status: 'idle',
  items: [],
  error: null, // last failed-request error { status, message } (null when healthy)
};

// Every thunk catches the ApiError thrown by apiClient and rejects with
// { status, message }. This unsticks `status` from 'loading' on failure and
// gives the 401 middleware a `payload.status` to branch on.
export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async (item, { rejectWithValue }) => {
    try {
      const response = await addToCart(item);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const updateCartAsync = createAsyncThunk(
  'cart/updateCart',
  async (update, { rejectWithValue }) => {
    try {
      const response = await updateCart(update);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const deleteItemFromCartAsync = createAsyncThunk(
  'cart/deleteItemFromCart',
  async ({ productId, userId }, { rejectWithValue }) => {
    try {
      const response = await deleteItemFromCart({ productId, userId });
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const resetCartAsync = createAsyncThunk(
  'cart/resetCart',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await resetCart(userId);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const fetchItemsByUserIdAsync = createAsyncThunk(
  'cart/fetchItemsByUserId',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetchItemsByUserId(userId);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items.push(action.payload);
      })
      .addCase(fetchItemsByUserIdAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchItemsByUserIdAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(updateCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCartAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        const index = state.items.findIndex((item) => item.product.id === action.payload.product.id)
        state.items[index] = action.payload;
      })
      .addCase(deleteItemFromCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteItemFromCartAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.product.id === action.payload.id)
        state.items.splice(index, 1);
        state.status = 'idle';
      })
      .addCase(resetCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(resetCartAsync.fulfilled, (state) => {
        state.status = 'idle';
        state.items = []
      })
      // One matcher covers every rejected cart thunk: mark failed + record error
      // so the UI leaves the loading state and can show a message.
      .addMatcher(
        isRejected(
          addToCartAsync,
          updateCartAsync,
          deleteItemFromCartAsync,
          resetCartAsync,
          fetchItemsByUserIdAsync
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload ?? { message: action.error?.message };
        }
      );
  },
});

export const selectItems = (state) => state.cart.items
export const selectCartStatus = (state) => state.cart.status
export const selectCartError = (state) => state.cart.error
export default cartSlice.reducer;
