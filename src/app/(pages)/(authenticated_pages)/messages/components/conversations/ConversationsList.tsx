import React, { useContext, useEffect } from "react";
import { bindActionCreators } from "redux";
import { useDispatch, useSelector } from "react-redux";
import ConversationView from "./ConversationView";
import {
  SetParticipantsType,
  SetSidType,
  SetUnreadMessagesType,
} from "../../types";
import { actionCreators, AppState } from "../../store";
import { getTypingMessage, unexpectedErrorNotification } from "../../helpers";
import { ReduxConversation } from "../../store/reducers/convoReducer";
import { getSdkConversationObject } from "../../conversations-objects";
import { ReduxMessage } from "../../store/reducers/messageListReducer";
import { APP_TITLE } from "../../branding";
import { getTranslation } from "../../utils/localUtils";
import { useSearchParams } from "next/navigation";
import { Client } from "@twilio/conversations";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import { MessagesContext } from "@/app/providers/MessagesProvider";

function getLastMessage(
  messages: ReduxMessage[],
  convoLoading: string,
  convoEmpty: string,
  typingData: string[],
  friendlyName?: any
) {
  if (messages === undefined || messages === null) {
    return convoLoading;
  }
  if (typingData.length) {
    return getTypingMessage(friendlyName ? [friendlyName] : typingData);
  }
  if (messages.length === 0) {
    return convoEmpty;
  }
  return messages[messages.length - 1].body || "Media message";
}

function isMyMessage(messages: ReduxMessage[]) {
  if (messages === undefined || messages === null || messages.length === 0) {
    return false;
  }
  return messages[messages.length - 1].author ===
    localStorage.getItem("username")
    ? messages[messages.length - 1]
    : false;
}

async function updateCurrentConvo(
  setSid: SetSidType,
  convo: ReduxConversation,
  updateParticipants: SetParticipantsType
) {
  setSid(convo.sid);

  const participants = await getSdkConversationObject(convo).getParticipants();
  updateParticipants(participants, convo.sid);
}

function setUnreadMessagesCount(
  currentconvoSid: string,
  convoSid: string,
  unreadMessages: Record<string, number>,
  updateUnreadMessages: SetUnreadMessagesType
) {
  if (currentconvoSid == convoSid && unreadMessages[convoSid] !== 0) {
    updateUnreadMessages(convoSid, 0);
    return 0;
  }
  if (currentconvoSid == convoSid) {
    return 0;
  }
  return unreadMessages[convoSid];
}

const ConversationsList: React.FC = () => {
  const params = useSearchParams();
  // const convoId = params.get("convoId");
  // const convoSearch = params.get("convoSearch");
  const { deleteSearchParam, setSearchParams, commit, getSearchParams } =
    useParamsManager();
  const convoSearch = getSearchParams("convoSearch");
  const sid = useSelector((state: AppState) => state.sid);
  const token = useSelector((state: AppState) => state.token);
  const conversations = useSelector((state: AppState) => state.convos);
  const messages = useSelector((state: AppState) => state.messages);
  const unreadMessages = useSelector((state: AppState) => state.unreadMessages);
  const participants = useSelector((state: AppState) => state.participants);
  const typingData: any = useSelector((state: AppState) => state.typingData);
  const users = useSelector((state: AppState) => state.users);
  const user = users[typingData[sid]];
  const friendlyName = user?.friendlyName.split(" ")[0];
  const use24hTimeFormat = useSelector(
    (state: AppState) => state.use24hTimeFormat
  );
  const local = useSelector((state: AppState) => state.local);
  const convoEmpty = getTranslation(local, "convoEmpty");
  const convoLoading = getTranslation(local, "convoLoading");

  const dispatch = useDispatch();
  const {
    updateCurrentConversation,
    updateParticipants,
    updateUnreadMessages,
    setLastReadIndex,
    addNotifications,
  } = bindActionCreators(actionCreators, dispatch);

  const setDocumentTitle = (sum: number) => {
    document.title = sum >= 1 ? `(${sum}) ${APP_TITLE}` : APP_TITLE;
  };

  useEffect(() => {
    if (conversations === undefined || conversations === null) return;
    const sum = Object.values(unreadMessages).reduce(
      (acc, value) => acc + value,
      0
    );
    setDocumentTitle(sum);

    return () => new AbortController().abort();
  }, [unreadMessages]);

  // useEffect(() => {
  //   return () => {
  //     updateCurrentConversation("");
  //   };
  // }, []);

  async function selectConvo(convo: ReduxConversation) {
    try {
      setLastReadIndex(convo.lastReadMessageIndex ?? -1);
      await updateCurrentConvo(
        updateCurrentConversation,
        convo,
        updateParticipants
      );
      //update unread messages
      updateUnreadMessages(convo.sid, 0);
      //set messages to be read
      const lastMessage =
        messages[convo.sid]?.length &&
        messages[convo.sid][messages[convo.sid]?.length - 1];
      if (lastMessage && lastMessage.index !== -1) {
        await getSdkConversationObject(convo).advanceLastReadMessageIndex(
          lastMessage.index
        );
      }
    } catch (e: any) {
      const pattern = /^Conversation with SID [a-zA-Z0-9]+ was not found\.$/;
      // An error with the pattern above occurs sometimes when creating a new message. The error only happens sometimes and does not affect the functionality and only causes the notification. So we are disabling the notification in this case.
      if (pattern.test(e.message)) {
        console.log(e.message);
        return;
      }
      unexpectedErrorNotification(e.message, addNotifications);
    }
  }
  // useEffect(() => {
  //   if (convoId && Array.isArray(conversations)) {
  //     let searchedConvo = conversations.find((convo) => convo.sid === convoId);
  //     if (!searchedConvo) return;
  //     selectConvo(searchedConvo);
  //   }
  // }, [convoId, conversations]);
  const { client } = useContext(MessagesContext);

  useEffect(() => {
    async function searchByName() {
      if (
        convoSearch &&
        Array.isArray(conversations) &&
        conversations.length > 0
      ) {
        try {
          const searchedConvo = await client.getConversationByUniqueName(
            convoSearch
          );
          if (!searchedConvo) return;
          selectConvo(searchedConvo);
        } catch (err) {
          console.log(err);
        }
      }
    }

    searchByName();
  }, [convoSearch, conversations]);

  const scrollToBottom = () => {
    const scrollableDiv = document.getElementById('scrollable');
    if (scrollableDiv) {
      scrollableDiv.scrollTo({
        top: scrollableDiv.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  if (conversations === undefined || conversations === null) {
    return <div className="empty" />;
  }

  return (
    <div id="conversation-list">
      {conversations.map((convo) => (
        <ConversationView
          use24hTimeFormat={use24hTimeFormat}
          key={convo.sid}
          convoId={convo.sid}
          setSid={updateCurrentConversation}
          currentConvoSid={sid}
          lastMessage={
            getLastMessage(
              messages[convo.sid],
              convoLoading,
              convoEmpty,
              typingData[convo.sid] ?? [],
              friendlyName
            ) ?? ""
          }
          messages={messages[convo.sid]}
          typingInfo={typingData[convo.sid] ?? []}
          myMessage={isMyMessage(messages[convo.sid])}
          unreadMessagesCount={setUnreadMessagesCount(
            sid,
            convo.sid,
            unreadMessages,
            updateUnreadMessages
          )}
          updateUnreadMessages={updateUnreadMessages}
          participants={participants[convo.sid] ?? []}
          convo={convo}
          onClick={async () => {
            try {
              setLastReadIndex(convo.lastReadMessageIndex ?? -1);
              await updateCurrentConvo(
                updateCurrentConversation,
                convo,
                updateParticipants
              );
              //update unread messages
              updateUnreadMessages(convo.sid, 0);
              //set messages to be read
              const lastMessage =
                messages[convo.sid].length &&
                messages[convo.sid][messages[convo.sid].length - 1];
              if (lastMessage && lastMessage.index !== -1) {
                await getSdkConversationObject(
                  convo
                ).advanceLastReadMessageIndex(lastMessage.index);
              }
              deleteSearchParam("convoSearch");
              scrollToBottom();
              commit();
            } catch (e: any) {
              unexpectedErrorNotification(e.message, addNotifications);
            }
          }}
        />
      ))}
    </div>
  );
};

export default ConversationsList;
