import { createAsyncThunk, createSlice, isRejected } from '@reduxjs/toolkit';
import {
  fetchProductsByFilter, fetchBrands, fetchCategory, fetchProductById, createProduct, upadteProduct
} from './productAPI';

const initialState = {
  products: [],
  brands: [],
  category: [],
  status: 'idle',
  totalItems: 0,
  selectedProduct: null,
  error: null, // last failed-request error { status, message }
};

// fetch product by id
export const fetchProductByIdAsync = createAsyncThunk(
  'product/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchProductById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

// fetch product with filters
export const fetchProductsByFilterAsync = createAsyncThunk(
  'product/fetchProductsByFilter',
  async ({ filter, sort, pagination, admin }, { rejectWithValue }) => {
    try {
      const response = await fetchProductsByFilter(filter, sort, pagination, admin);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

// fetch brands
export const fetchBrandsAsync = createAsyncThunk(
  'product/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchBrands();
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

// fetch category
export const fetchCategoryAsync = createAsyncThunk(
  'product/fetchCategory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchCategory();
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

// create product
export const createProductAsync = createAsyncThunk(
  'product/createProduct',
  async (product, { rejectWithValue }) => {
    try {
      const response = await createProduct(product);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

// update product
export const updateProductAsync = createAsyncThunk(
  'product/updateProduct',
  async (update, { rejectWithValue }) => {
    try {
      const response = await upadteProduct(update);
      return response.data;
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message });
    }
  }
);

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearSelectedproduct: (state) => {
      state.selectedProduct = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsByFilterAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductsByFilterAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.products = action.payload.products
        state.totalItems = action.payload.totalItems
      })
      .addCase(fetchBrandsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBrandsAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.brands = action.payload;
      })
      .addCase(fetchCategoryAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategoryAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.category = action.payload;
      })
      .addCase(fetchProductByIdAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductByIdAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.selectedProduct = action.payload;
      })
      .addCase(createProductAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createProductAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.products.push(action.payload)
      })
      .addCase(updateProductAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        const index = state.products.findIndex((product) => product.id === action.payload.id)
        state.products[index] = action.payload
        state.selectedProduct = action.payload;
      })
      // Unstick status + record error on any rejected product thunk.
      .addMatcher(
        isRejected(
          fetchProductsByFilterAsync,
          fetchBrandsAsync,
          fetchCategoryAsync,
          fetchProductByIdAsync,
          createProductAsync,
          updateProductAsync
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload ?? { message: action.error?.message };
        }
      );
  },
});

export const { clearSelectedproduct } = productSlice.actions;

export const selectAllProducts = (state) => state.product.products
export const selectTotalItems = (state) => state.product.totalItems
export const selectBrands = (state) => state.product.brands
export const selectCategory = (state) => state.product.category
export const selectedProductById = (state) => state.product.selectedProduct
export const selectProductListStatus = (state) => state.product.status
export const selectProductError = (state) => state.product.error

export default productSlice.reducer;
