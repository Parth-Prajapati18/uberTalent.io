import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import { bindActionCreators } from "redux";
import { useDispatch, useSelector } from "react-redux";

import {
  Message,
  Conversation,
  Participant,
  Client,
  ConnectionState,
} from "@twilio/conversations";
import { Box } from "@twilio-paste/core";

import { actionCreators, AppState } from "./store";
import ConversationContainer from "./components/conversations/ConversationContainer";
import ConversationsContainer from "./components/conversations/ConversationsContainer";
import {
  AddMessagesType,
  SetParticipantsType,
  SetUnreadMessagesType,
} from "./types";
import useAppAlert from "./hooks/useAppAlerts";
import Notifications from "./Notifications";
import stylesheet from "./styles";
import { handlePromiseRejection } from "./helpers";
import AppHeader from "./AppHeader";

import {
  initFcmServiceWorker,
  subscribeFcmNotifications,
  showNotification,
} from "./firebase-support";
import { MessagesContext } from "@/app/providers/MessagesProvider";

async function loadUnreadMessagesCount(
  convo: Conversation,
  updateUnreadMessages: SetUnreadMessagesType
) {
  let count = 0;

  try {
    count =
      (await convo.getUnreadMessagesCount()) ??
      (await convo.getMessagesCount());
  } catch (e: any) {
    console.error("getUnreadMessagesCount threw an error", e);
  }

  updateUnreadMessages(convo.sid, count);
}

async function handleParticipantsUpdate(
  participant: Participant,
  updateParticipants: SetParticipantsType
) {
  const result = await participant.conversation.getParticipants();
  updateParticipants(result, participant.conversation.sid);
}

const AppContainer: React.FC = () => {
  
  const {client, openedConversation} = useContext(MessagesContext);
  const [alertsExist, AlertsView] = useAppAlert();
  return (
    <Box style={stylesheet.appWrapper}>
      <AlertsView />
      <Notifications />
      {/* <Box>
        <AppHeader
          user={username ?? ""}
          client={client}
          onSignOut={async () => {
            logout();

            // unregister service workers
            const registrations =
              await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
              registration.unregister();
            }
          }}
          connectionState={connectionState ?? "disconnected"}
        />
      </Box> */}
      <Box style={stylesheet.appContainer(alertsExist)} className="message-page-padding">
        <ConversationsContainer client={client} />
        <Box style={stylesheet.messagesWrapper}>
          <ConversationContainer
            conversation={openedConversation}
            client={client}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AppContainer;
