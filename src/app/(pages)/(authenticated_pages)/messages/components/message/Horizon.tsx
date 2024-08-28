import { Box, Text } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";
import React, { ForwardedRef, LegacyRef, Ref } from "react";

//this line is added to the original code due to compile error
//type HorizonProps = { messageCount: number; ref: Ref<HTMLElement> };
type HorizonProps = { messageCount: number; ref: LegacyRef<HTMLElement> | Ref<HTMLElement> | undefined };
/* eslint-disable react/display-name */
const Horizon: React.FC<HorizonProps> = React.forwardRef(
  ({ messageCount }, ref: ForwardedRef<HTMLElement>) => {
    const theme = useTheme();
    return (
      <Box
        ref={ref}
        style={{
          textAlign: "center",
          backgroundColor: theme.backgroundColors.colorBackgroundPrimaryWeaker,
          padding: 2,
          fontSize: "14px",
          lineHeight: "20px",
          margin: "16px 0",
        }}
      >
        <Text as="span" color="colorTextLink">
          {messageCount} new {messageCount > 1 ? "messages" : "message"}
        </Text>
      </Box>
    );
  }
);

export default Horizon;
