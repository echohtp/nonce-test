// import DashboardFeature from '@/components/dashboard/dashboard-feature';
import NonceButtons from "@/components/nonce/buttons";

export default function Page() {
  return (
    <>
      {/* <DashboardFeature /> */}
      {/* {connected ? <h1>connected</h1> : <h1>not connected</h1>} */}
      <div className="flex mt-4">
      <NonceButtons/>
      </div>
    </>
  );
}
