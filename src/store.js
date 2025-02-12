import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: {},
  friends: [],
  openChats: [],
  currentChat: null,
  uiPreferences: {
    isFriendsListMinimized: true
  }
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const { friendId, message } = action.payload;
      if (!state.messages[friendId]) {
        state.messages[friendId] = [];
      }
      state.messages[friendId].push(message);
    },
    setMessages: (state, action) => {
      const { friendId, messages } = action.payload;
      state.messages[friendId] = messages;
    },
    setFriends: (state, action) => {
      state.friends = action.payload;
    },
    addOpenChat: (state, action) => {
      if (!state.openChats.includes(action.payload)) {
        state.openChats.push(action.payload);
      }
    },
    removeOpenChat: (state, action) => {
      state.openChats = state.openChats.filter(id => id !== action.payload);
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    toggleFriendsList: (state) => {
      state.uiPreferences.isFriendsListMinimized = !state.uiPreferences.isFriendsListMinimized;
    }
  }
});

export const { 
  addMessage, 
  setMessages, 
  setFriends, 
  addOpenChat, 
  removeOpenChat,
  setCurrentChat,
  toggleFriendsList
} = chatSlice.actions;

const store = configureStore({
  reducer: {
    chat: chatSlice.reducer
  }
});

export default store; 