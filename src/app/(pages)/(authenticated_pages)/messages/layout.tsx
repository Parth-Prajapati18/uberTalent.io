"use client";

import { useRouter } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "./store"; // Update the import path
import { Theme } from "@twilio-paste/core/theme";
import { Box } from "@twilio-paste/core";
import React from "react";
import styles from "./styles";

export default function ConvoPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Box style={{...styles.app, height: "calc(100% - 64px)"}}>
        {/* <Provider store={store}> */}
          <Theme.Provider theme="twilio">
            <Box style={styles.app}>
              {children}
            </Box>
          </Theme.Provider>
        {/* </Provider> */}
    </Box>
  );
}
