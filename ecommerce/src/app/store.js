import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistReducer, persistStore,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import productReducer from '../features/product/productSlice';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import orderReducer from '../features/order/orderSlice';
import userReducer from '../features/user/userSlice';

// Store keys renamed for clarity (were the misleading `user`/`users` pair):
//   auth  -> authReducer  (loggedInUser / login state)   [selectLoggedInUser]
//   user  -> userReducer  (profile + user orders)        [selectUserInfo]
const rootReducer = combineReducers({
  product: productReducer,
  auth: authReducer,
  cart: cartReducer,
  order: orderReducer,
  user: userReducer,
});

// Persist ONLY the auth slice, so a hard refresh keeps the user logged in.
// (The token lives separately in localStorage['token'], read by apiClient.)
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // redux-persist dispatches non-serializable actions; exclude them from RTK's
  // serializable check to avoid noisy dev warnings.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
