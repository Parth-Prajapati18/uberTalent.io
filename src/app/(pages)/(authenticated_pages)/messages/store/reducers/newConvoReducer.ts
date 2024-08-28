import { conversationsMap } from "../../conversations-objects";
import { ActionType } from "../action-types";
import { Action } from "../actions";

export type NewConversationState = {
  newConvoTitle: string;
  newConvoParticipantEmail: string;
  defaultMessage: string;
};

const initialState: NewConversationState = {
  newConvoTitle: "",
  newConvoParticipantEmail: "",
  defaultMessage: "",
};

const reducer = (
  state: NewConversationState = initialState,
  action: Action
): {
  newConvoTitle: string;
  newConvoParticipantEmail: string;
  defaultMessage: string;
} => {
  switch (action.type) {
    case ActionType.CREATE_NEW_CONVO: {
      const {
        newConvoTitle,
        newConvoParticipantEmail,
        defaultMessage,
      } = action.payload;

      return {
        newConvoTitle,
        newConvoParticipantEmail,
        defaultMessage: defaultMessage || "",
      };
    }

    case ActionType.CLEAR_NEW_CONVO_STATE: {
      return {
        newConvoTitle: "",
        newConvoParticipantEmail: "",
        defaultMessage: "",
      };
    }

    default:
      return state;
  }
};

export default reducer;
