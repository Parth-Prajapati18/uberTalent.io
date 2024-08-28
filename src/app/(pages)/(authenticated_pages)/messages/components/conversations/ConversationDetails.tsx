import { Box, Input } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import { EditIcon } from "@twilio-paste/icons/esm/EditIcon";

import ParticipantsView from "./ParticipantsView";
import Settings from "../settings/Settings";
import React, { useState, useEffect, useRef, useContext } from "react";
import { ReduxConversation } from "../../store/reducers/convoReducer";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import { Client, JSONValue } from "@twilio/conversations";
import { useSelector } from "react-redux";
import { AppState } from "../../store";
import { MessagesContext } from "@/app/providers/MessagesProvider";
import { useUserContext } from "@/app/providers/UserProvider";
import { getAuthorFriendlyNameBySid } from "@/app/utils/chatUtils";
import { useFLSlideOVerContext } from "@/app/providers/FreelancerSlideOverProvider";
import { classNames } from "@/app/utils";

interface ConversationDetailsProps {
  convoSid: string;
  participants: ReduxParticipant[];
  convo: ReduxConversation;
  updateConvoName: (title: string) => void;
  chatAttr?: any
}

const ConversationDetails: React.FC<ConversationDetailsProps> = (
  props: ConversationDetailsProps
) => {
  const theme = useTheme();
  const token = useSelector((state: AppState) => state.token);
  const { user, userType } = useUserContext();
  const { client } = useContext(MessagesContext);
  const [isManageParticipantOpen, setIsManageParticipantOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(
    props.convo.friendlyName ?? props.convo.sid
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleEditClick = () => {
    setEditedText(props.convo.friendlyName ?? props.convo.sid);
    setIsEditing(true);
  };

  const handleInputChange = (convoName: string) => {
    setEditedText(convoName);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
        if (editedText !== props.convo.friendlyName) {
          props.updateConvoName(editedText);
        }
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        setIsEditing(false);
        if (editedText !== props.convo.friendlyName) {
          props.updateConvoName(editedText);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [editedText]);

  const participantsBySid = new Map(props.participants.map((p) => [p.sid, p]));

  const users = useSelector((state: AppState) => state.users);
  const { setDisableInvite, setOpenSlideOver, setFlSlideOverData } = useFLSlideOVerContext();

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
        minHeight: 65,
        maxHeight: 65,
        paddingLeft: 16,
        paddingRight: 16,
        borderBottomStyle: "solid",
        borderBottomWidth: 1,
        borderBottomColor: theme.borderColors.colorBorderWeak,
      }}
    >
      <Box
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Box
          color="colorText"
          fontFamily="fontFamilyText"
          fontSize="fontSize50"
          fontWeight="fontWeightBold"
          maxHeight="100%"
          onClick={handleEditClick}
          style={{ width: "calc(100% - 70px)" }}
        >
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              {/* {isEditing ? (
                <Input
                  type="text"
                  value={editedText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  ref={inputRef}
                />
              ) : ( */}
              {props.chatAttr?.jobTitle && (
                <div className="flex items-center gap-x-1 text-sm sm:text-lg text-lime-950 p-0 m-0 mt-3">
                  <BriefcaseIcon style={{ width: "16px", height: "16px" }} />
                  <div className="p-0 m-0">{props.chatAttr?.jobTitle}</div>
                </div>
              )}
              {/* {props.convo.friendlyName ?? props.convo.sid} */}
              {user.email ? (
                <small
                  className={classNames(
                    "text-sm sm:text-base",
                    user?.client?.id ? "cursor-pointer hover:text-gray-500" : ""
                  )}
                  onClick={handleViewProfile}
                >
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
              )}
              {/* <EditIcon decorative={false} title="Edit conversation name" /> */}
            </div>
            {userType === "CLIENT" && (
              <button
                type="button"
                onClick={handleViewProfile}
                className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
              >
                View Profile
              </button>
            )}
          </div>
        </Box>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <ParticipantsView
            participants={props.participants}
            onParticipantListOpen={() => setIsManageParticipantOpen(true)}
          />

          <Settings
            convo={props.convo}
            participants={props.participants}
            isManageParticipantOpen={isManageParticipantOpen}
            setIsManageParticipantOpen={setIsManageParticipantOpen}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ConversationDetails;
