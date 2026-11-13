import Breakline from "@/common/components/elements/Breakline";

import Story from "./Story";
import CareerList from "./CareerList";
import EducationList from "./EducationList";
import OrganizationList from "./OrganizationList";
import CVPreview from "@/common/components/elements/CVPreview";

const About = () => {
  return (
    <>
      <Story />
      <Breakline className="my-8" />
      <CVPreview />
      <Breakline className="my-8" />
      <CareerList />
      <Breakline className="my-8" />
      <EducationList />
      <Breakline className="my-8" />
      <OrganizationList />
    </>
  );
};

export default About;
