"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { ReactElement } from "react";

import { Box, Spinner } from "@twilio-paste/core";

import Login from "./components/login/login";
import AppContainer from "./AppContainer";
import { actionCreators, AppState } from "./store";
import { getToken } from "./api";
import { useUser } from "@clerk/nextjs";

function App(): ReactElement {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { login } = bindActionCreators(actionCreators, dispatch);
  const token = useSelector((state: AppState) => state.token);
  const userData = useUser();

  // const username = "john@prisma.io";
  // const password = "test";

  useEffect(() => {
    if (!userData || !userData.user) return;
    const username = userData?.user?.primaryEmailAddress?.emailAddress;
    if (!username) return;
  
    getToken()
      .then((token) => {
        login(token);
      })
      .catch((err: any) => {
        console.log(err);
        // localStorage.setItem("password", "");
      })
      .finally(() => {
        setLoading(false);
      });

  }, [userData.user]);

  const setToken = (token: string) => {
    login(token);
    setLoading(false);
  };

  if (!token && !loading) {
    return <Login setToken={setToken} />;
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        position="absolute"
        height="100%"
        width="100%"
      >
        <Spinner size="sizeIcon110" decorative={false} title="Loading" />
      </Box>
    );
  }

  return <AppContainer />;
}

export default App;
