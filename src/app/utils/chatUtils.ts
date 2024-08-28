import { Client, JSONValue } from "@twilio/conversations";
import { ReduxParticipant } from "../(pages)/(authenticated_pages)/messages/store/reducers/participantsReducer";
import { UsersState } from "../(pages)/(authenticated_pages)/messages/store/reducers/userReducer";
import { MAX_MESSAGE_LINE_WIDTH } from "@/app/(pages)/(authenticated_pages)/messages/constants";
import wrap from "word-wrap";

type MessageDetails = {
  chatFriendlyName: string;
  chatUniqueName: string;
  participantEmail: string;
  extraAttributes?: JSONValue;
  messageString?: string;
};
export async function sendMessage(
  token: string,
  messageDetails: MessageDetails
) {
  const {
    chatFriendlyName,
    chatUniqueName,
    messageString,
    participantEmail,
    extraAttributes,
  } = messageDetails;
  const client = new Client(token);
  let convo = undefined;
  try {
    const existingConversation = await client.getConversationByUniqueName(
      chatUniqueName
    );
    convo = existingConversation;
    if (messageString) await convo.sendMessage(messageString);
  } catch (err: any) {
    // Code for error in case conversation with unique name does not exist. In this case, we will create new converstion.
    if ( err?.body?.code === 50350) {
      convo = await client.createConversation();
      await convo.updateFriendlyName(chatFriendlyName);
      await convo.updateUniqueName(chatUniqueName);
      await convo.add(participantEmail);
      if (extraAttributes) await convo.updateAttributes(extraAttributes);
      await convo.join();
      if (messageString) await convo.sendMessage(messageString);
    }
    console.log("Message sending err: ", err);
  }
  
  if (convo) return convo;
}

export const formatMessage = (text: string, wrapText: boolean) => {
  // determine if hyperlink, if hyperlink:
  if (hasAnchorTags(text)) {
    //remove hyperlinks from text, isolate
    // link = renderAnchorTags(text);
    text = text.replaceAll(/<a[^>]*>([^<]+)<\/a>/g, "");
  }
  // wrap text
  if (wrapText) {
    text = wrap(text ?? "", {
      width: MAX_MESSAGE_LINE_WIDTH,
      indent: "",
      cut: true,
    });
  }
  
  return text;
};

export const hasAnchorTags = (text: string) => {
  const anchorRegex = /<a[^>]*>([^<]+)<\/a>/g;
  return anchorRegex.test(text);
};

export const getAuthorFriendlyNameBySid = (
  sid: string,
  participantsBySid: Map<string, ReduxParticipant>,
  users: UsersState
) => {
  const participant = participantsBySid.get(sid);
  if (participant == null || participant.identity == null) return "";

  const user = users[participant.identity];

  return user?.friendlyName || "";
};

export const getAuthorAvatarBySid = (
  sid: string,
  participantsBySid: Map<string, ReduxParticipant>,
  users: UsersState
) => {
  const participant = participantsBySid.get(sid);
  if (participant == null || participant.identity == null) return "";

  const user = users[participant.identity];

  return user?.avatar || "";
};
