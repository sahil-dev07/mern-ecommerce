import { createAsyncThunk, createSlice, isRejected } from '@reduxjs/toolkit';
import { createOrder, fetchAllOrders, updateOrder } from './orderAPI';

const initialState = {
  orders: [],
  status: 'idle',
  currentOrder: null,
  totalOrders: 0,
  error: null, // last failed-request error { status, message }
};

export const createOrderAsync = createAsyncThunk(
  'order/createOrder',
  async (order, { rejectWithValue }) => {
    try {
      const response = await createOrder(order);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const updateOrderAsync = createAsyncThunk(
  'order/updateOrder',
  async (order, { rejectWithValue }) => {
    try {
      const response = await updateOrder(order);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const fetchAllOrderAsync = createAsyncThunk(
  'order/fetchAllOrders',
  async ({ sort, pagination }, { rejectWithValue }) => {
    try {
      const response = await fetchAllOrders(sort, pagination);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrder: (state) => {
      state.currentOrder = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrderAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.orders.push(action.payload);
        state.currentOrder = action.payload
      })
      .addCase(fetchAllOrderAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllOrderAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.totalOrders
      })
      .addCase(updateOrderAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateOrderAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        const index = state.orders.findIndex((order) => order.id === action.payload.id)
        state.orders[index] = action.payload
      })
      // Unstick status + record error on any rejected order thunk.
      .addMatcher(
        isRejected(createOrderAsync, updateOrderAsync, fetchAllOrderAsync),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload ?? { message: action.error?.message };
        }
      );
  },
});

export const { resetOrder } = orderSlice.actions;

export const selectCurrentOrder = (state) => state.order.currentOrder
export const selectOrders = (state) => state.order.orders
export const selectTotalOrders = (state) => state.order.totalOrders
export const selectOrderError = (state) => state.order.error

export default orderSlice.reducer;
