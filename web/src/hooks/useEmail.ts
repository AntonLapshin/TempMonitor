import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";

export const useEmail = () => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const session = await fetchAuthSession();
      setEmail(session.tokens?.idToken?.payload.email as string);
    })();
  }, []);

  return email;
};
