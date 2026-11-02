import Codewars from "./Codewars";
import CodingActive from "./CodingActive";
import Contributions from "./Contributions";
import RepositoryObservatory from "./RepositoryObservatory/RepositoryObservatory";

import Breakline from "@/common/components/elements/Breakline";
import { GITHUB_ACCOUNTS } from "@/common/constants/github";
import { CODEWARS_ACCOUNT } from "@/common/constants/codewars";

const Dashboard = () => {
  return (
    <>
      <RepositoryObservatory />
      <Breakline className="my-8" />
      <Contributions endpoint={GITHUB_ACCOUNTS.endpoint} />
      <Breakline className="my-8" />
      <CodingActive />
      <Breakline className="my-8" />
      <Codewars endpoint={CODEWARS_ACCOUNT.endpoint} />
    </>
  );
};

export default Dashboard;
