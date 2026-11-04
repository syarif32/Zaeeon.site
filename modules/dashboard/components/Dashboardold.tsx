import Codewars from "./Codewars";
import Monkeytype from "./Monkeytype";
import CodingActive from "./CodingActive";
import Contributions from "./Contributions";
import TechnologyFootprint from "./TechnologyFootprint/TechnologyFootprint";
import Breakline from "@/common/components/elements/Breakline";
import { GITHUB_ACCOUNTS } from "@/common/constants/github";
import { CODEWARS_ACCOUNT } from "@/common/constants/codewars";
import Umami from "./Umami";
import DevelopmentPulse from "./DevelopmentPulse/DevelopmentPulse";
import RepositoryObservatory from "./RepositoryObservatory";

const Dashboard = () => {
  return (
    <>
      {/* <Umami /> */}

      <Contributions endpoint={GITHUB_ACCOUNTS.endpoint} />
      <Breakline className="my-8" />
      <TechnologyFootprint />
      <Breakline className="my-8" />
      <DevelopmentPulse />
      <Breakline className="my-8" />
      <CodingActive />
      <Breakline className="my-8" />
      {/* <Codewars endpoint={CODEWARS_ACCOUNT.endpoint} />
      <Breakline className="my-8" /> */}
      <RepositoryObservatory />
      <Breakline className="my-8" />
      {/* <Monkeytype /> */}
    </>
  );
};

export default Dashboard;
