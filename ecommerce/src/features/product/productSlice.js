import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchAllProducts, fetchProductsByFilter, fetchBrands, fetchCategory, fetchProductById, createProduct, upadteProduct } from './productAPI';
const initialState = {
  products: [],
  brands: [],
  category: [],
  status: 'idle',
  totalItems: 0,
  selectedProduct: null
};

// fetch all product
// export const fetchAllProductsAsync = createAsyncThunk(
//   'product/fetchAllProducts',
//   async () => {
//     const response = await fetchAllProducts();

//     return response.data;
//   }
// );

// fetch product by id
export const fetchProductByIdAsync = createAsyncThunk(
  'product/fetchProductById',
  async (id) => {
    // console.log("slice " + id)
    const response = await fetchProductById(id);
    return response.data;
  }
);

// fetch product with filters
export const fetchProductsByFilterAsync = createAsyncThunk(
  'product/fetchProductsByFilter',
  async ({ filter, sort, pagination, admin }) => {
    const response = await fetchProductsByFilter(filter, sort, pagination, admin);
    // console.log("get product async")
    return response.data;
  }
);

// fetch brands
export const fetchBrandsAsync = createAsyncThunk(
  'product/fetchBrands',
  async () => {
    const response = await fetchBrands();
    return response.data;
  }
);

// fetch category
export const fetchCategoryAsync = createAsyncThunk(
  'product/fetchCategory',
  async () => {
    const response = await fetchCategory();
    return response.data;
  }
);


// create Product 
export const createProductAsync = createAsyncThunk(
  'product/createProduct',
  async (product) => {
    const response = await createProduct(product);
    return response.data;
  }
);

// update Product 
export const updateProductAsync = createAsyncThunk(
  'product/updateProduct',
  async (update) => {
    console.log("in sclice")
    const response = await upadteProduct(update);
    return response.data;
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
      // .addCase(fetchAllProductsAsync.pending, (state) => {
      //   state.status = 'loading';
      // })
      // .addCase(fetchAllProductsAsync.fulfilled, (state, action) => {
      //   state.status = 'idle';
      //   state.products = action.payload;
      // })
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
        const index = state.products.findIndex((product => product.id === action.payload.id))
        state.products[index] = (action.payload)
        state.selectedProduct = action.payload;

        // console.log(index, action.payload)
      })
  },
});

export const { clearSelectedproduct } = productSlice.actions;


export const selectAllProducts = (state) => state.product.products
export const selectTotalItems = (state) => state.product.totalItems
export const selectBrands = (state) => state.product.brands
export const selectCategory = (state) => state.product.category
export const selectedProductById = (state) => state.product.selectedProduct
export const selectProductListStatus = (state) => state.product.status

export default productSlice.reducer;


