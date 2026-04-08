// services/partTypeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

const apiUrl = "parttype";

// Async Thunks
export const fetchPartTypes = createAsyncThunk(
  "admin/fetchPartTypes",
  async () => {
    try {
      const response = await api.get(apiUrl);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const createPartType = createAsyncThunk(
  "admin/createPartType",
  async (partType) => {
    try {
      const response = await api.post(apiUrl, partType);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const updatePartType = createAsyncThunk(
  "admin/updatePartType",
  async (partType) => {
    try {
      const response = await api.put(`${apiUrl}/${partType.id}`, partType);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const deletePartType = createAsyncThunk(
  "admin/deletePartType",
  async (id) => {
    try {
      const response = await api.delete(`${apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

// Slice
const partTypeSlice = createSlice({
  name: "partType",
  initialState: { partTypes: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    // FETCH
    builder
      .addCase(fetchPartTypes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPartTypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.partTypes = action.payload;
      })
      .addCase(fetchPartTypes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
    // ... similar patterns for createPartType, updatePartType, and deletePartType
  },
});

export default partTypeSlice.reducer;
