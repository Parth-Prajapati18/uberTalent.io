import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { useContext, useEffect, useMemo, useState } from "react";

import { Client } from "@twilio/conversations";
import { Box } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";

import { actionCreators, AppState } from "../../store";
import ConversationDetails from "./ConversationDetails";
import MessagesBox from "../message/MessagesBox";
import MessageInputField from "../message/MessageInputField";
import styles from "../../styles";
import { ReduxConversation } from "../../store/reducers/convoReducer";

import { getSdkConversationObject } from "../../conversations-objects";
import { successNotification } from "../../helpers";
import { CONVERSATION_MESSAGES, ERROR_MODAL_MESSAGES } from "../../constants";
import ActionErrorModal from "../modals/ActionErrorModal";
import { getTranslation } from "../../utils/localUtils";
import { MessagesContext } from "@/app/providers/MessagesProvider";
import { getAuthorFriendlyNameBySid } from "@/app/utils/chatUtils";
import { useUserContext } from "@/app/providers/UserProvider";

import { isParticipantOnline } from "../../api";

interface ConvoContainerProps {
  conversation?: ReduxConversation;
  client?: Client;
}

const ConversationContainer: React.FC<ConvoContainerProps> = (
  props: ConvoContainerProps
) => {
  const theme = useTheme();
  const { user } = useUserContext();
  const sid = useSelector((state: AppState) => state.sid);
  const loadingStatus = useSelector((state: AppState) => state.loadingStatus);
  const participants =
    useSelector((state: AppState) => state.participants)[sid] ?? [];
  const messages = useSelector((state: AppState) => state.messages);
  const typingData =
    useSelector((state: AppState) => state.typingData)[sid] ?? [];
  const lastReadIndex = useSelector((state: AppState) => state.lastReadIndex);
  const use24hTimeFormat = useSelector(
    (state: AppState) => state.use24hTimeFormat
  );
  const local = useSelector((state: AppState) => state.local);
  const greeting = getTranslation(local, "greeting");

  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);

  const dispatch = useDispatch();
  const { pushMessages, updateConversation, addNotifications } =
    bindActionCreators(actionCreators, dispatch);

  const [showError, setErrorToShow] = useState<
    | {
        title: string;
        description: string;
      }
    | false
  >();
  const [errorData, setErrorData] = useState<
    | {
        message: string;
        code: number;
      }
    | undefined
  >();

  const { client } = useContext(MessagesContext);
  const [chatAttr, setChatAttr] = useState<any>({});

  useEffect(() => {
    (async () => {
      try {
        const convoData = await client.getConversationBySid(sid);
        const attr = await convoData.getAttributes();
        setChatAttr(attr);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [sid]);

  const sdkConvo = useMemo(() => {
    if (props.conversation) {
      const conversation = getSdkConversationObject(props.conversation);
      if (conversation) {
        return conversation;
      }
    }
    return;
  }, [props.conversation?.sid]);

  const users = useSelector((state: AppState) => state.users);
  const participantsBySid = new Map(participants.map((p) => [p.sid, p]));

  const handleDroppedFiles = (droppedFiles: File[]) => {
    setDroppedFiles(droppedFiles);
  };

  /**
   * Depricated at the moment as we don't want to setnd a message for every user message they type.
   * @param message
   */
  const sendNewMsgEmail = async (message: string) => {
    console.log("sendNewMsgEmail", message);
    const name = getAuthorFriendlyNameBySid(
      participants?.find((part) => part.identity !== user.email)?.sid || "",
      participantsBySid,
      users
    )?.split(" ")[0];

    const emailTo = participants?.find(
      (part) => part.identity !== user.email
    )?.identity;
     
     let isOnline = false;
     if (message && message.trim().length > 0) {
       isOnline = await isParticipantOnline(client, emailTo ? emailTo : "");
       console.log("isOnline", isOnline);
     }
     
    if(!isOnline) {
      try {
        await fetch("/api/mail", {
          method: "POST",
          body: JSON.stringify({
            to: emailTo,
            from: "UberTalent<support@ubertalent.io>",
            subject: "New Message Received on UberTalent",
            html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                  <tr>
                      <td style="padding: 20px;">
                          <h1 style="color: #333333; text-align: center;">New Message on UberTalent</h1>
                          <p style="color: #333333;">Hi ${name},</p>
                          <p style="color: #333333;">You've got a new message on UberTalent!</p>
                                        <p style="color: #666666;">Message Details:</p>
                          <p style="color: #333333;"><strong>Sender: </strong> ${user.firstName} ${user.lastName}</p>
                          <p style="color: #333333;"><strong>Message: </strong><br><br>${message}</p>
                          <p style="color: #333333; text-align: center; margin: 30px;">
                            <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/messages" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">Reply</a>
                          </p>
                          <p style="color: #333333;">Best regards,<br>The UberTalent Team</p>
                      </td>
                  </tr>
              </table>
          </body>`,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.log("ERROR", err);
      }

    }
    

  };

  return (
    <Box style={styles.convosWrapperBox}>
      <ActionErrorModal
        errorText={showError || ERROR_MODAL_MESSAGES.CHANGE_CONVERSATION_NAME}
        isOpened={!!showError}
        onClose={() => {
          setErrorToShow(false);
          setErrorData(undefined);
        }}
        error={errorData}
      />
      {sid && props.conversation && props.client ? (
        <>
          <ConversationDetails
            convoSid={sid}
            convo={props.conversation}
            participants={participants}
            chatAttr={chatAttr}
            updateConvoName={(val: string) => {
              sdkConvo
                ?.updateFriendlyName(val)
                .then((convo) => {
                  updateConversation(convo.sid, convo);
                  successNotification({
                    message: CONVERSATION_MESSAGES.NAME_CHANGED,
                    addNotifications,
                  });
                })
                .catch((e) => {
                  setErrorData(e);
                  setErrorToShow(ERROR_MODAL_MESSAGES.CHANGE_CONVERSATION_NAME);
                });
            }}
          />

          <MessagesBox
            key={sid}
            convoSid={sid}
            convo={props.conversation}
            upsertMessage={pushMessages}
            client={props.client}
            messages={messages[sid]}
            loadingState={loadingStatus}
            participants={participants}
            lastReadIndex={lastReadIndex}
            use24hTimeFormat={use24hTimeFormat}
            handleDroppedFiles={handleDroppedFiles}
            chatAttr={chatAttr}
          />

          <MessageInputField
            convoSid={sid}
            client={props.client}
            messages={messages[sid]}
            convo={props.conversation}
            typingData={typingData}
            droppedFiles={droppedFiles}
            handleNewMsgEmail={(message: string) => sendNewMsgEmail(message)}
          />
        </>
      ) : (
        <>
          <Box
            style={{
              display: "flex",
              height: "100%",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
              fontSize: theme.fontSizes.fontSize30,
              fontWeight: theme.fontWeights.fontWeightNormal,
              lineHeight: "20px",
              color: theme.textColors.colorTextIcon,
            }}
          >
            {greeting}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ConversationContainer;
