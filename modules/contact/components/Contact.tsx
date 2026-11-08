import Breakline from "@/common/components/elements/Breakline";

import ContactList from "./ContactList";
import ContactForm from "./ContactForm";
import DigitalContactCard from "./DigitalContactCard";
const Contact = () => {
  return (
    <>
      <DigitalContactCard />
      <Breakline className="my-6" />
      <ContactList />
      <Breakline className="my-6" />
      <ContactForm />
    </>
  );
};

export default Contact;
