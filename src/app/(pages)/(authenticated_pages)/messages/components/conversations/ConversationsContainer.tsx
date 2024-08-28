import React, { useEffect, useState } from "react";
import { Client } from "@twilio/conversations";
import { ChevronDoubleLeftIcon } from "@twilio-paste/icons/esm/ChevronDoubleLeftIcon";
import { Box, Input } from "@twilio-paste/core";
import { ChevronDoubleRightIcon } from "@twilio-paste/icons/esm/ChevronDoubleRightIcon";

import CreateConversationButton from "./CreateConversationButton";
import ConversationsList from "./ConversationsList";
import styles from "../../styles";

import { useDispatch, useSelector } from "react-redux";
import { filterConversations } from "../../store/action-creators";
import { AppState, actionCreators } from "../../store";
import { getTranslation } from "../../utils/localUtils";
import { addChatParticipant, addConversation } from "../../api";
import { bindActionCreators } from "redux";
import { getSdkConversationObject } from "../../conversations-objects";
import { unexpectedErrorNotification } from "../../helpers";

interface ConvosContainerProps {
  client?: Client;
}

const ConversationsContainer: React.FC<ConvosContainerProps> = (
  props: ConvosContainerProps
) => {
  const [listHidden, hideList] = useState(false);
  const dispatch = useDispatch();
  const {
    updateCurrentConversation,
    addNotifications,
    updateParticipants,
    clearNewConvoParticipantState,
  } = bindActionCreators(actionCreators, dispatch);
  const local = useSelector((state: AppState) => state.local);
  const { newConvoTitle, newConvoParticipantEmail, defaultMessage } = useSelector(
    (state: AppState) => state.newConvo
  );
  const search = getTranslation(local, "convoSearch");

  const handleSearch = (searchString: string) => {
    dispatch(filterConversations(searchString));
  };

  async function createNewChat(
    title: string,
    email: string,
    defaultMessage?: string
  ) {
    const convo = await addConversation(
      title,
      updateParticipants,
      props.client,
      addNotifications
    );

    updateCurrentConversation(convo.sid);

    const sdkConvo = getSdkConversationObject(convo);
    await addChatParticipant(email?.trim(), sdkConvo, addNotifications);

    // Sending a default first message

    // if (message.length == 0 && files.length == 0) {
    //   return;
    // }

    if (defaultMessage) {
      const newMessageBuilder = sdkConvo
        .prepareMessage()
        .setBody(defaultMessage);
      const messageIndex = await newMessageBuilder.build().send();

      try {
        await sdkConvo.advanceLastReadMessageIndex(messageIndex ?? 0);
      } catch (e: any) {
        unexpectedErrorNotification(e.message, addNotifications);
        throw e;
      }
    }
  }

  // useEffect(() => {
  //   if (newConvoTitle && props.client) {
  //     createNewChat(newConvoTitle, newConvoParticipantEmail, defaultMessage);
  //     clearNewConvoParticipantState();
  //   }
  // }, [newConvoTitle, props.client]);

  return (
    <Box
      style={
        listHidden
          ? { ...styles.convosWrapper, ...styles.collapsedList }
          : styles.convosWrapper
      }
    >
      <Box style={styles.newConvoButton}>
        {/* <CreateConversationButton
          client={props.client}
          collapsed={listHidden}
        /> */}
        <Box marginTop="space60">
          <Input
            aria-describedby="convo_string_search"
            id="convoString"
            name="convoString"
            type="text"
            placeholder={search}
            onChange={(e) => handleSearch(e.target.value)}
            required
            autoFocus
          />
        </Box>
      </Box>
      <Box style={styles.convoList}>
        {!listHidden ? <ConversationsList /> : null}
      </Box>
      <Box style={styles.collapseButtonBox}>
        <Box
          paddingTop="space30"
          style={{
            paddingLeft: 10,
            paddingRight: 10,
          }}
          onClick={() => hideList(!listHidden)}
        >
          {listHidden ? (
            <ChevronDoubleRightIcon decorative={false} title="Collapse" />
          ) : (
            <ChevronDoubleLeftIcon decorative={false} title="Collapse" />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ConversationsContainer;
