import {
  Client,
  ConnectionState,
  Conversation,
  Message,
  Participant,
} from "@twilio/conversations";
import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AppState,
  actionCreators,
} from "../(pages)/(authenticated_pages)/messages/store";
import useAppAlert from "../(pages)/(authenticated_pages)/messages/hooks/useAppAlerts";
import { bindActionCreators } from "redux";
import {
  initFcmServiceWorker,
  showNotification,
  subscribeFcmNotifications,
} from "../(pages)/(authenticated_pages)/messages/firebase-support";
import { handlePromiseRejection } from "../(pages)/(authenticated_pages)/messages/helpers";
import {
  AddMessagesType,
  SetParticipantsType,
  SetUnreadMessagesType,
} from "../(pages)/(authenticated_pages)/messages/types";
import {
  getToken,
  readUserProfile,
  updateFriendlyName,
} from "../(pages)/(authenticated_pages)/messages/api";
import { useUserContext } from "./UserProvider";
export const MessagesContext = createContext<any | undefined>(undefined);
async function loadUnreadMessagesCount(
  convo: Conversation,
  updateUnreadMessages: SetUnreadMessagesType,
  currentUserEmail: string
) {
  let count = 0;
  try {
    count =
      (await convo.getUnreadMessagesCount()) ??
      (await convo.getMessagesCount());
    
    // If there are unread messages, we check all the unread messages. For each unread message which has the current user as the author, we decrease the total count of unread messages by 1. So if there are 4 unread messages, and one of them was sent via the system by the current user, the total unread messages coun will be set to 3
    if(count > 0) {
      let data = await convo.getMessages();
      let messages = data.items;
      let unreadMessages = messages.slice(-count)
      for(let msg of unreadMessages) {
        if(msg.author === currentUserEmail) count = count - 1;
      }
  
    }
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
const MessagesProvider = ({ children }: { children: React.ReactElement }) => {
  /* eslint-disable */
  const [connectionState, setConnectionState] = useState<ConnectionState>();
  const [client, setClient] = useState<Client>();
  const [clientIteration, setClientIteration] = useState(0);
  const token = useSelector((state: AppState) => state.token);
  const conversations = useSelector((state: AppState) => state.convos);
  const sid = useSelector((state: AppState) => state.sid);
  const sidRef = useRef("");
  // const [alertsExist, AlertsView] = useAppAlert();
  sidRef.current = sid;
  const { user } = useUserContext();
  const username = user.email;
  const dispatch = useDispatch();
  const {
    upsertMessages,
    updateLoadingState,
    updateParticipants,
    updateUser,
    updateUnreadMessages,
    startTyping,
    endTyping,
    upsertConversation,
    login,
    removeMessages,
    removeConversation,
    updateCurrentConversation,
    addNotifications,
    logout,
    clearAttachments,
    updateTimeFormat,
    updateLocal,
  } = bindActionCreators(actionCreators, dispatch);
  const updateTypingIndicator = (
    participant: Participant,
    sid: string,
    callback: (sid: string, user: string) => void
  ) => {
    const {
      // eslint-disable-next-line
      // @ts-ignore
      attributes: { friendlyName },
      identity,
    } = participant;
    if (identity === localStorage.getItem("username")) {
      return;
    }
    callback(sid, identity || friendlyName || "");
  };
  useEffect(() => {
    initFcmServiceWorker().catch(() => {
      console.error(
        "FCM initialization failed: no push notifications will be available"
      );
    });
  }, []);
  useEffect(() => {
    if (!token) return;
    const client = new Client(token);
    setClient(client);
    const fcmInit = async () => {
      await subscribeFcmNotifications(client);
    };
    fcmInit().catch(() => {
      console.error(
        "FCM initialization failed: no push notifications will be available"
      );
    });
    client.on("conversationJoined", (conversation) => {
      //console.log("conversationJoined", conversation);
      upsertConversation(conversation);
      conversation.on("typingStarted", (participant) => {
        handlePromiseRejection(
          () =>
            updateTypingIndicator(participant, conversation.sid, startTyping),
          addNotifications
        );
      });
      conversation.on("typingEnded", async (participant) => {
        await handlePromiseRejection(
          async () =>
            updateTypingIndicator(participant, conversation.sid, endTyping),
          addNotifications
        );
      });
      handlePromiseRejection(async () => {
        if (conversation.status === "joined") {
          const result = await conversation.getParticipants();
          updateParticipants(result, conversation.sid);
          const messages = await conversation.getMessages();
          upsertMessages(conversation.sid, messages.items);
          await loadUnreadMessagesCount(conversation, updateUnreadMessages, username);
        }
      }, addNotifications);
    });
    client.on("conversationRemoved", async (conversation: Conversation) => {
      updateCurrentConversation("");
      await handlePromiseRejection(async () => {
        removeConversation(conversation.sid);
        updateParticipants([], conversation.sid);
      }, addNotifications);
    });
    client.on("messageAdded", async (message: Message) => {
      await upsertMessage(message, upsertMessages, updateUnreadMessages);
      if (message.author === localStorage.getItem("username")) {
        clearAttachments(message.conversation.sid, "-1");
      }
    });
    client.on("userUpdated", async (event) => {
      await updateUser(event.user);
    });
    client.on("participantLeft", async (participant) => {
      await handlePromiseRejection(
        async () => handleParticipantsUpdate(participant, updateParticipants),
        addNotifications
      );
    });
    client.on("participantUpdated", async (event) => {
      await handlePromiseRejection(
        async () =>
          handleParticipantsUpdate(event.participant, updateParticipants),
        addNotifications
      );
    });
    client.on("participantJoined", async (participant) => {
      await handlePromiseRejection(
        async () => handleParticipantsUpdate(participant, updateParticipants),
        addNotifications
      );
    });
    client.on("conversationUpdated", async ({ conversation }) => {
      await handlePromiseRejection(
        () => upsertConversation(conversation),
        addNotifications
      );
    });
    client.on("messageUpdated", async ({ message }) => {
      await handlePromiseRejection(
        async () =>
          upsertMessage(message, upsertMessages, updateUnreadMessages),
        addNotifications
      );
    });
    client.on("messageRemoved", async (message) => {
      await handlePromiseRejection(
        () => removeMessages(message.conversation.sid, [message]),
        addNotifications
      );
    });
    client.on("pushNotification", (event) => {
      // @ts-ignore
      if (event.type !== "twilio.conversations.new_message") {
        return;
      }
      if (Notification.permission === "granted") {
        showNotification(event);
      } else {
        console.log("Push notification is skipped", Notification.permission);
      }
    });
    client.on("tokenAboutToExpire", async () => {
   
        const token = await getToken();
        await client.updateToken(token);
        login(token);
    
    });
    client.on("tokenExpired", async () => {
  
        const token = await getToken();
        login(token);
        setClientIteration((x) => x + 1);
  
    });
    client.on("connectionStateChanged", (state) => {
      setConnectionState(state);
    });
    updateLoadingState(false);
    return () => {
      client?.removeAllListeners();
    };
  }, [clientIteration, token]);

  useEffect(() => {
      if (!user || !client || !user.firstName) return;
      readUserProfile(username, client).then(async (data) => {
        if (!data?.friendlyName) {
          updateFriendlyName(`${user.firstName} ${user.lastName}`, data);
        }
        let attr = data?.attributes as { avatar?: string };
        if (attr && !attr.avatar) {
          await data?.updateAttributes({ avatar: user.profileImg });
        }
      });
 
  }, [user.firstName, client]);
  useEffect(() => {
    const abortController = new AbortController();
    const use24hTimeFormat = localStorage.getItem("use24hTimeFormat");
    if (use24hTimeFormat !== null) {
      updateTimeFormat(true);
    }
    const local = localStorage.getItem("local") || "en-US";
    updateLocal(local);
    return () => {
      abortController.abort();
    };
  }, []);
  async function upsertMessage(
    message: Message,
    upsertMessages: AddMessagesType,
    updateUnreadMessages: SetUnreadMessagesType
  ) {
    //transform the message and add it to redux
    await handlePromiseRejection(async () => {
      if (sidRef.current === message.conversation.sid) {
        await message.conversation.advanceLastReadMessageIndex(message.index);
      }
      upsertMessages(message.conversation.sid, [message]);
      await loadUnreadMessagesCount(message.conversation, updateUnreadMessages, username);
    }, addNotifications);
  }
  const openedConversation = useMemo(
    () => conversations.find((convo) => convo.sid === sid),
    [sid, conversations]
  );
  return (
    <MessagesContext.Provider value={{ client, openedConversation }}>
      {children}
    </MessagesContext.Provider>
  );
};
export default MessagesProvider;