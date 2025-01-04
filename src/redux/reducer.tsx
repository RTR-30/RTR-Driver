import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  email: string | null;
  name: string | null; // Assuming a token is part of the response
  id: string | null;
  phoneNumber: string | null;
  field: string | null;
}

const initialState: UserState = {
  email: null,
  name: null,
  id: null,
  phoneNumber: null,
  field: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.id = action.payload.id;
      state.phoneNumber = action.payload.phoneNumber;
      state.field = action.payload.field;
    },
    clearUser: (state) => {
      state.email = null;
      state.name = null;
      state.id = null;
      state.phoneNumber = null;
      state.field = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
