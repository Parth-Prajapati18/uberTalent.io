import { User } from "@twilio/conversations";

import { ActionType } from "../action-types";
import { Action } from "../actions";
import { usersMap } from "../../conversations-objects";

export type ReduxUser = {
  identity: string;
  friendlyName: string;
  avatar: string | any;
};

export type UsersState = {
  [identity: string]: ReduxUser;
};

const initialState: UsersState = {};

const reduxifyUser = (user: User | any): ReduxUser => ({
  identity: user.identity,
  friendlyName: user.friendlyName ?? "",
  avatar: user?.attributes?.avatar ?? "",
});

const reducer = (
  state: UsersState = initialState,
  action: Action
): UsersState => {
  switch (action.type) {
    case ActionType.UPDATE_USER:
      const user = action.payload;
      usersMap.set(user.identity, user);

      return {
        ...state,
        [user.identity]: reduxifyUser(user),
      };
    default:
      return state;
  }
};

export default reducer;
