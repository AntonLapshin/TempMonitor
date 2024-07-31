import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { readRecentRecordsMock } from "./api/readRecentRecords.mock";
import { getDeviceStats } from "./tools/getDeviceStats";
import { useMemo } from "react";
import { Loader } from "./components/Loader/Loader";
import { Grid2Cols } from "./components/Primitives";
import { Device } from "./components/Device";

const queryClient = new QueryClient();

export const Dashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Monitor />
    </QueryClientProvider>
  );
};

const Monitor = () => {
  //   const queryClient = useQueryClient();

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: readRecentRecordsMock,
    staleTime: 60 * 1000,
  });

  const stats = useMemo(() => {
    return getDeviceStats(data);
  }, [data]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Grid2Cols css={{ gap: "1rem", width: '100%' }}>
      {stats.map((deviceStats) => {
        return <Device key={deviceStats.name} {...deviceStats}></Device>;
      })}
    </Grid2Cols>
  );
};
