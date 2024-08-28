import React, { useContext, useEffect, useState } from "react";
import { AvatarGroup as PasteAvatarGroup } from "@twilio-paste/avatar";
import Avatar from "./Avatar";
import { IconSize } from "@twilio-paste/style-props";
import { MessagesContext } from "@/app/providers/MessagesProvider";

type DisplayedParticipant = {
  name: string;
  identity?: string;
};
type AvatarGroupProps = {
  displayedParticipants: DisplayedParticipant[];
  size?: IconSize;
};

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  displayedParticipants,
  size,
}) => {
  const [participantsProperitesMap, setParticipantsProperitesMap] =
    useState<any>();
  const { client } = useContext(MessagesContext);
  async function loadParticipantsAvatars(displayedParticipants: any) {
    let temp: any = {};
    for (const participant of displayedParticipants) {
      const twilioUser = await client.getUser(participant.identity);
      if (!participant.identity) return;
      temp[participant.identity] = temp[participant.identity] || {};
      temp[participant.identity].avatar =
        twilioUser?.state?.attributes?.avatar || "";
      temp[participant.identity].firstName =
        twilioUser?.state?.friendlyName?.split(" ")?.[0] || "";
    }
    setParticipantsProperitesMap(temp);
  }

  useEffect(() => {
    if (!displayedParticipants || !Array.isArray(displayedParticipants)) return;
    loadParticipantsAvatars(displayedParticipants);
  }, [displayedParticipants]);

  return (
    <PasteAvatarGroup
      size={size ?? "sizeIcon70"}
      variant="user"
      // eslint-disable-next-line react/no-children-prop
      children={displayedParticipants.map((displayedParticipant, index) => {
        return (
          <Avatar
            name={
              participantsProperitesMap &&
              participantsProperitesMap[displayedParticipant.identity!] &&
              participantsProperitesMap[displayedParticipant.identity!]
                .firstName
                ? participantsProperitesMap[displayedParticipant.identity!]
                    ?.firstName
                : displayedParticipant.name
            }
            avatar={
              participantsProperitesMap &&
              participantsProperitesMap[displayedParticipant.identity!] &&
              participantsProperitesMap[displayedParticipant.identity!].avatar
                ? participantsProperitesMap[displayedParticipant.identity!]
                    ?.avatar
                : ""
            }
            size={size}
            key={index}
          />
        );
      })}
    />
  );
};

export { AvatarGroup };
export default AvatarGroup;
