"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { UserType } from "../types";
import {
  getToken,
  readUserProfile,
  updateFriendlyName,
} from "../(pages)/(authenticated_pages)/messages/api";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../(pages)/(authenticated_pages)/messages/store";
import { trackEvent, identify, identifyUser } from "@/app/lib/mixpanel";
import { useClerk } from "@clerk/nextjs";

declare const rg4js: any;
declare const Beacon: any;
declare const Intercom: any;

type UserContextType = {
  user: UserType;
  // setUser: React.Dispatch<React.SetStateAction<UserType>>;
  userType: "CLIENT" | "FREELANCER" | null;
  fetchUser: () => Promise<void>;
};
const UserContext = createContext<UserContextType>({} as UserContextType);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType>({} as UserType);
  const [userType, setUserType] = useState<"CLIENT" | "FREELANCER" | null>(
    null
  );
  const { signOut } = useClerk();

  const dispatch = useDispatch();
  const { login } = bindActionCreators(actionCreators, dispatch);

  const fetchUser = async () => {
    try {
      //console.log("fetching utc user");
      const res = await fetch("/api/user");

      if (!res.ok) {
        console.warn("Error Fetching Current User");
        return;
      }
      

      const user: UserType = await res.json();
      //console.log("UserProvider:  User", user);
      setUser(user);
       //console.log("UserProvider:  User", user);

      if (!user) {
        throw new Error("User not found");
      }

      let _userType: string | null= null;
      if (user.client) {
        setUserType("CLIENT");
        _userType = "CLIENT";
      } else if (user.freelancerProfile) {
        setUserType("FREELANCER");
        _userType = "FREELANCER";
      } else {
        setUserType(null);
        _userType = null;
      }

      // rg4js("setUser", {
      //   identifier: user.email,
      //   isAnonymous: false,
      //   email: user.email,
      //   firstName: user.firstName,
      //   fullName: user.firstName + " " + user.lastName,
      // });


      //console.log("UserProvider:  Intercom Update", userType);
      //console.log("UserProvider:  Intercom Update", _userType);
      Intercom("update", {
        user_id: user.id,
        email: user.email,
        name: user.firstName + " " + user.lastName,
        Profile_Type: _userType
      });

      //mixpanel
      identify(user.email);
      identifyUser(user);

      //todo: Intercom client/company setup

      // Beacon("identify", {
      //   name: user.firstName + " " + user.lastName,
      //   email: user.email,
      // });


    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // /////////////////////////////

  // function App(): ReactElement {
  //   const [loading, setLoading] = useState(true);
  //   const dispatch = useDispatch();
  //   const { login } = bindActionCreators(actionCreators, dispatch);
  //   const token = useSelector((state: AppState) => state.token);
  //   const userData = useUser();

  //   // const username = "john@prisma.io";
  //   // const password = "test";

  useEffect(() => {
    if(user?.freelancerProfile?.status === "SUSPENDED") {
      signOut({ redirectUrl: `/sign-in?status=SUSPENDED` });
    }
  }, [user?.freelancerProfile?.status]);

  useEffect(() => {
    if (!user) return;
    const username = user.email;
    if (!username) return;
    const password = "test";
   
      //console.log("UserProvider: fetching token from twilio.");
      getToken()
        .then((token) => {
          login(token);

          // const client = new Client(token);
          // readUserProfile(username, client).then((data) => {
          //   // console.log("data ==> ", data)
          //   if (!data?.friendlyName) {
          //     updateFriendlyName(`${user.firstName} ${user.lastName}`, data);
          //   }
          // });
        })
        .catch((err: any) => {
          console.log(err);
          // localStorage.setItem("password", "");
        });
 
  }, [user.email]);

  return (
    <UserContext.Provider value={{ user, userType, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("User context has to be used within <UserProvider>");
  }
  return context;
};

export default UserProvider;
