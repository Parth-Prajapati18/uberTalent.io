import { useContext, useEffect, useState } from "react";
import { Box, Text } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";

import {
  MessageStatus,
  ReduxMessage,
} from "../../store/reducers/messageListReducer";
import SendingIcon from "../icons/Sending";
import DeliveredIcon from "../icons/Delivered";
import ReadIcon from "../icons/Read";
import FailedIcon from "../icons/Failed";
import BellMuted from "../icons/BellMuted";

import { NOTIFICATION_LEVEL } from "../../constants";
import { SetSidType, SetUnreadMessagesType } from "../../types";
import { getMessageStatus } from "../../api";

import { getLastMessageTime } from "../../utils/timestampUtils";

import { ReduxConversation } from "../../store/reducers/convoReducer";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import { useDispatch, useSelector } from "react-redux";
import { AppState, actionCreators } from "../../store";
import { useUserContext } from "@/app/providers/UserProvider";
import {
  getAuthorAvatarBySid,
  getAuthorFriendlyNameBySid,
} from "@/app/utils/chatUtils";
import { getSdkParticipantObject } from "../../conversations-objects";
import { bindActionCreators } from "redux";
import { MessagesContext } from "@/app/providers/MessagesProvider";
import { BriefcaseIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { classNames } from "@/app/utils";
import { useFLSlideOVerContext } from "@/app/providers/FreelancerSlideOverProvider";

interface SingleConvoProps {
  convoId: string;
  setSid: SetSidType;
  currentConvoSid: string;
  lastMessage: string;
  myMessage: ReduxMessage | false;
  unreadMessagesCount: number;
  convo: ReduxConversation;
  updateUnreadMessages: SetUnreadMessagesType;
  onClick: () => void;
  participants: ReduxParticipant[];
  messages: ReduxMessage[];
  typingInfo: string[];
  use24hTimeFormat: boolean;
}

const measureWidth = (text: string): number => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return 0;
  }
  context.font = "bold 14px Inter";
  return context.measureText(text).width;
};

function calculateUnreadMessagesWidth(count: number) {
  if (count === 0 || !count) {
    return 0;
  }
  return measureWidth(count.toString()) + 32;
}

function truncateMiddle(text: string, countWidth: number) {
  const width = measureWidth(text);
  if (width > 288 - countWidth) {
    const textLength = text.length;
    const avgLetterSize = width / textLength;
    const nrOfLetters = (288 - countWidth) / avgLetterSize;
    const delEachSide = (textLength - nrOfLetters + 1) / 2;
    const endLeft = Math.floor(textLength / 2 - delEachSide);
    const startRight = Math.ceil(textLength / 2 + delEachSide);
    return text.substr(0, endLeft) + "..." + text.substr(startRight);
  }
  return text;
}

const ConversationView: React.FC<SingleConvoProps> = (
  props: SingleConvoProps
) => {
  const {
    convo,
    convoId,
    myMessage,
    lastMessage,
    unreadMessagesCount,
    use24hTimeFormat,
  } = props;
  const [backgroundColor, setBackgroundColor] = useState();
  const [chatAttr, setChatAttr] = useState<any>({});

  const title = truncateMiddle(
    convo.friendlyName ?? convo.sid,
    calculateUnreadMessagesWidth(unreadMessagesCount)
  );
  const dispatch = useDispatch();
  const { updateUser } = bindActionCreators(actionCreators, dispatch);

  const theme = useTheme();
  const textColor =
    unreadMessagesCount > 0
      ? theme.textColors.colorText
      : theme.textColors.colorTextIcon;
  const muted = convo.notificationLevel === NOTIFICATION_LEVEL.MUTED;

  const [lastMsgStatus, setLastMsgStatus] = useState("");
  const time = getLastMessageTime(props.messages, use24hTimeFormat);

  useEffect(() => {
    if (props.currentConvoSid === convo.sid) {
      setBackgroundColor(theme.backgroundColors.colorBackgroundStrong);
      return;
    }
    setBackgroundColor(theme.backgroundColors.colorBackgroundRowStriped);
  }, [props.currentConvoSid, convo.sid]);

  const { client } = useContext(MessagesContext);

  useEffect(() => {
    (async () => {
      try {
        const convoData = await client.getConversationBySid(props.convo?.sid);
        const attr = await convoData.getAttributes();
        setChatAttr(attr);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [props.convo?.sid]);

  useEffect(() => {
    if (myMessage && !props.typingInfo.length) {
      getMessageStatus(myMessage, props.participants).then((statuses) => {
        if (statuses[MessageStatus.Read]) {
          setLastMsgStatus(MessageStatus.Read);
          return;
        }
        if (statuses[MessageStatus.Delivered]) {
          setLastMsgStatus(MessageStatus.Delivered);
          return;
        }
        if (statuses[MessageStatus.Failed]) {
          setLastMsgStatus(MessageStatus.Failed);
          return;
        }
        if (statuses[MessageStatus.Sending]) {
          setLastMsgStatus(MessageStatus.Sending);
          return;
        }
      });
    }
  }, [convo, myMessage, lastMessage, props.participants, props.typingInfo]);

  const participantsBySid = new Map(props.participants.map((p) => [p.sid, p]));

  const users = useSelector((state: AppState) => state.users);

  const { user } = useUserContext();
  const { setDisableInvite, setOpenSlideOver, setFlSlideOverData } = useFLSlideOVerContext();

  useEffect(() => {
    // if (!messages) return;
    // messages.forEach((message) => {
    //   const participant = message.participantSid
    //     ? participantsBySid.get(message.participantSid)
    //     : null;
    //   if (participant && participant.identity) {
    //     if (!users[participant.identity]) {
    //       const sdkParticipant = getSdkParticipantObject(participant);
    //       sdkParticipant.getUser().then((sdkUser) => {
    //         updateUser(sdkUser);
    //       });
    //     }
    //   }
    //   setFirstMessagePerDay(getFirstMessagePerDate(messages));
    const participants = props.participants || [];
    participants.forEach((participant) => {
      // console.log("Here: ", participant);
      if (participant.identity && !users[participant.identity]) {
        const sdkParticipant = getSdkParticipantObject(participant);
        sdkParticipant.getUser().then((sdkUser) => {
          updateUser(sdkUser);
        });
      }
    });
    // });
  }, [JSON.stringify(props.participants)]);

  async function handleViewProfile(e: any) {
    try {
      if(!user?.client?.id) return "";
      e.stopPropagation();
      const find = props?.participants?.find(
        (part) => part.identity !== user.email
      );
      const participant = participantsBySid.get(find?.sid || "");
      if (!participant?.identity) return "";
      const profileUser = users[participant.identity];
      if (!profileUser?.identity) return "";
      const URL = `/api/freelancer/profile?email=${profileUser?.identity}`;
      const res = await fetch(URL);
      const { data } = await res.json();
      setDisableInvite(true);
      setFlSlideOverData(data);
      setOpenSlideOver(true);
    } catch (error) {
      console.error("Error while fetch user data", error);
    }
  }

  return (
    <Box
      style={{
        paddingTop: 14,
        paddingBottom: 14,
        paddingLeft: 16,
        paddingRight: 16,
        cursor: "pointer",
        backgroundColor: backgroundColor,
      }}
      id={convoId}
      className="name"
      onMouseOver={() => {
        if (convo.sid === props.currentConvoSid) {
          return;
        }
        setBackgroundColor(theme.backgroundColors.colorBackgroundStrong);
      }}
      onMouseOut={() => {
        if (convo.sid === props.currentConvoSid) {
          return;
        }
        setBackgroundColor(theme.backgroundColors.colorBackgroundRowStriped);
      }}
      onClick={props.onClick}
    >
      <Box
        style={{
          backgroundColor: backgroundColor,
        }}
      >
        <Box display="flex">
          <Box
            style={{
              width: 288,
              fontWeight: theme.fontWeights.fontWeightSemibold,
              fontSize: 14,
              color: muted
                ? theme.textColors.colorTextInverseWeaker
                : theme.textColors.colorText,
            }}
          >
            {muted ? <BellMuted /> : null}
            <div
              className={classNames(
                "flex items-center",
                getAuthorAvatarBySid(
                  props?.participants?.find(
                    (part) => part.identity !== user.email
                  )?.sid || "",
                  participantsBySid,
                  users
                ) ? "gap-2" : "gap-1"
              )}
              style={{ verticalAlign: "top", paddingLeft: muted ? 4 : 0 }}
            >
              {getAuthorAvatarBySid(
                props?.participants?.find(
                  (part) => part.identity !== user.email
                )?.sid || "",
                participantsBySid,
                users
              ) ? (
                <div className={classNames("flex-shrink-0 h-8 w-8", user?.client?.id ? "group" : "")} onClick={handleViewProfile}>
                  <Image
                    className={classNames("rounded-full max-h-8 max-w-8 object-cover", user?.client?.id ? "group-hover:opacity-75" : "")}
                    src={
                      getAuthorAvatarBySid(
                        props?.participants?.find(
                          (part) => part.identity !== user.email
                        )?.sid || "",
                        participantsBySid,
                        users
                      ) || ""
                    }
                    alt="User_Avat"
                    height={48}
                    width={48}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 h-10 w-10">
                  <UserCircleIcon />
                </div>
              )}
              <div className="flex flex-col">
                {/* {title} */}
                {chatAttr && chatAttr.jobTitle ? (
                  <div className="flex items-center gap-x-1 text-lime-950">
                    {/* <BriefcaseIcon style={{ width: "16px", height: "16px" }} /> */}
                    <div className="text-xs p-0 m-0 leading-3">
                      {chatAttr.jobTitle}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                {user.email ? (
                  <small className={classNames(user?.client?.id ? "hover:text-gray-500" : "")} onClick={handleViewProfile}>
                    {
                      getAuthorFriendlyNameBySid(
                        props?.participants?.find(
                          (part) => part.identity !== user.email
                        )?.sid || "",
                        participantsBySid,
                        users
                      )?.split(" ")[0]
                    }
                  </small>
                ) : (
                  "Loading"
                )}{" "}
              </div>
            </div>
          </Box>
          {unreadMessagesCount > 0 && (
            <Box paddingLeft="space30">
              <Box
                backgroundColor="colorBackgroundBrandStronger"
                color="colorTextInverse"
                fontFamily="fontFamilyText"
                fontWeight="fontWeightBold"
                fontSize="fontSize30"
                lineHeight="lineHeight30"
                paddingLeft="space30"
                paddingRight="space30"
                style={{ borderRadius: 12, opacity: muted ? 0.2 : 1 }}
              >
                {unreadMessagesCount}
              </Box>
            </Box>
          )}
        </Box>
        <Box
          style={{
            paddingTop: 4,
            color: textColor,
            fontWeight: theme.fontWeights.fontWeightNormal,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {!props.typingInfo.length && lastMsgStatus ? (
              <Box display="flex" paddingRight={"space20"} alignItems="center">
                {lastMsgStatus === MessageStatus.Sending && props.myMessage && (
                  <SendingIcon />
                )}
                {lastMsgStatus === MessageStatus.Delivered &&
                  props.myMessage && <DeliveredIcon />}
                {lastMsgStatus === MessageStatus.Failed && props.myMessage && (
                  <FailedIcon color="#D61F1F" />
                )}
                {lastMsgStatus === MessageStatus.Read && props.myMessage && (
                  <ReadIcon />
                )}
              </Box>
            ) : null}
            <Box
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {lastMsgStatus === MessageStatus.Failed ? (
                <Text
                  as="span"
                  color="colorTextError"
                  fontWeight={"fontWeightSemibold"}
                >
                  {"Message failed to send"}
                </Text>
              ) : (
                <Text as="span" color="colorTextWeak">
                  {lastMessage}
                </Text>
              )}
            </Box>
          </Box>
          <Box style={{ whiteSpace: "nowrap", paddingLeft: 4 }}>
            <Text
              as="span"
              color={"colorTextWeak"}
              fontSize="fontSize20"
              fontWeight={"fontWeightSemibold"}
            >
              {time}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ConversationView;
