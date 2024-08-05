import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { getDeviceStats } from "./tools/getDeviceStats";
import { useMemo } from "react";
import { Loader } from "./components/Loader/Loader";
import { Grid2Cols } from "./components/Primitives";
import { Device } from "./components/Device";
import { readRecentRecords } from "./api/readRecentRecords";

const queryClient = new QueryClient();

export const Dashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Monitor />
    </QueryClientProvider>
  );
};

const UPDATE_INTERVAL = 60 * 1000;

const Monitor = () => {
//   useEffect(() => {
//     (async () => {
//       const session = await fetchAuthSession();
//       const { credentials, identityId } = session;
//       console.debug({ identityId });
//     })();
//   }, []);
  
  const { data, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: readRecentRecords,
    staleTime: UPDATE_INTERVAL,
  });

  const stats = useMemo(() => {
    return getDeviceStats(data);
  }, [data]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Grid2Cols css={{ gap: "1rem", width: "100%" }}>
      {stats.map((deviceStats) => {
        return <Device key={deviceStats.deviceName} {...deviceStats}></Device>;
      })}
    </Grid2Cols>
  );
};
